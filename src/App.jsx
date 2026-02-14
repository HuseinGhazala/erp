import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  LayoutDashboard, 
  ListTodo, 
  History, 
  User,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Monitor,
  Camera,
  X,
  ShieldAlert,
  Zap,
  Eye,
  LogOut,
  Mail,
  Lock,
  ShieldCheck,
  Users,
  Activity,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { supabase, isSupabaseEnabled } from './lib/supabase';

// API Configuration - من الكود أو من .env (VITE_GEMINI_API_KEY)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDZjChAhYFIb9qKztVMuXJ1_rINiB_Xlvw"; 
const GEMINI_URL = apiKey ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}` : null;

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // لوحة الموظف: الاسم والدور من جدول profiles
  const [authLoading, setAuthLoading] = useState(isSupabaseEnabled());
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // لوحة الأدمن
  const [adminEmployees, setAdminEmployees] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSelectedForTask, setAdminSelectedForTask] = useState(null);
  const [adminTaskText, setAdminTaskText] = useState('');
  const [adminSelectedForActivity, setAdminSelectedForActivity] = useState(null);
  const [adminActivityData, setAdminActivityData] = useState({ sessions: [], tasks: [], screenshots: [] });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [screenshotIntervalMinutes, setScreenshotIntervalMinutes] = useState(10);
  const [adminScreenshotInterval, setAdminScreenshotInterval] = useState(10);
  const [requestingScreenshotFor, setRequestingScreenshotFor] = useState(null);
  const [newTaskNotification, setNewTaskNotification] = useState(null);
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [addEmpError, setAddEmpError] = useState('');
  const [addEmpSuccess, setAddEmpSuccess] = useState(false);
  const [adminGalleryScreenshots, setAdminGalleryScreenshots] = useState([]);
  const [adminGalleryLoading, setAdminGalleryLoading] = useState(false);

  // الملف الشخصي للموظف (تحرير الاسم، الجوال، الصورة)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditName, setProfileEditName] = useState('');
  const [profileEditPhone, setProfileEditPhone] = useState('');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState(null);
  const [profileRefresh, setProfileRefresh] = useState(0);
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Screen Capture States
  const [screenStream, setScreenStream] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isPolicyBlocked, setIsPolicyBlocked] = useState(false);
  const [monitoringMode, setMonitoringMode] = useState('real'); // 'real' or 'virtual'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // اسم العرض ودور الأدمن (يُعرَّفان مبكراً لأن useEffects تستخدمهما)
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'موظف';
  const displayRole = profile?.role || 'موظف';
  const isAdmin = profile?.role === 'admin';

  // Timer logic
  useEffect(() => {
    let interval;
    if (isWorking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isWorking]);

  // جلب مدة اللقطة التلقائية من الإعدادات
  useEffect(() => {
    if (!supabase || !user?.id) return;
    supabase.from('app_settings').select('value').eq('key', 'screenshot_interval_minutes').single().then(({ data }) => {
      const n = parseInt(data?.value, 10);
      if (n >= 1 && n <= 120) setScreenshotIntervalMinutes(n);
    }).catch(() => {});
  }, [supabase, user?.id]);

  // Auto-screenshot logic (المدة من لوحة الأدمن)
  useEffect(() => {
    let screenshotTimer;
    const ms = screenshotIntervalMinutes * 60 * 1000;
    if (isWorking && monitoringEnabled && ms >= 60000) {
      screenshotTimer = setInterval(() => {
        takeScreenshot();
      }, ms);
    }
    return () => clearInterval(screenshotTimer);
  }, [isWorking, monitoringEnabled, monitoringMode, screenStream, screenshotIntervalMinutes]);

  // استماع لطلبات الأدمن: لقطة يدوية للموظف الحالي
  useEffect(() => {
    if (!supabase || !user?.id) return;
    const channel = supabase.channel('screenshot_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'screenshot_requests', filter: `user_id=eq.${user.id}` }, () => {
        takeScreenshot();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, user?.id]);

  // إشعار عند إضافة مهمة جديدة من الأدمن
  useEffect(() => {
    if (!supabase || !user?.id) return;
    const channel = supabase.channel('new_tasks')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        const row = payload.new;
        if (row?.text) {
          setTasks(prev => {
            if (prev.some(t => t.id === row.id)) return prev;
            return [{ id: row.id, text: row.text, completed: row.completed || false }, ...prev];
          });
          setNewTaskNotification(row.text);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('مهمة جديدة من الإدارة', { body: row.text, icon: '/vite.svg' });
          }
          setTimeout(() => setNewTaskNotification(null), 6000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, user?.id]);

  // Supabase Auth: جلب الجلسة ومتابعة تغيير تسجيل الدخول
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // تحميل المهام والأرشيف وملف الموظف من Supabase عند وجود مستخدم
  useEffect(() => {
    if (!user?.id || !supabase) return;
    const loadTasks = async () => {
      const { data } = await supabase.from('tasks').select('id, text, completed').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data?.length) setTasks(data.map(t => ({ id: t.id, text: t.text, completed: t.completed })));
    };
    const loadHistory = async () => {
      const { data } = await supabase.from('work_sessions').select('date, start_time as start, end_time as end, duration, tasks_completed as tasks').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data?.length) setHistory(data.map(h => ({ ...h, dateDisplay: new Date(h.date + 'T12:00:00').toLocaleDateString('ar-EG') })));
    };
    const loadProfile = async () => {
      const { data } = await supabase.from('profiles').select('full_name, role, avatar_url, phone').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          const { data: signed } = await supabase.storage.from('avatars').createSignedUrl(data.avatar_url, 86400);
          setAvatarDisplayUrl(signed?.signedUrl || null);
        } else setAvatarDisplayUrl(null);
      } else {
        setProfile({ full_name: user.user_metadata?.full_name || user.email?.split('@')[0], role: 'موظف' });
        setAvatarDisplayUrl(null);
      }
    };
    loadTasks();
    loadHistory();
    loadProfile();
  }, [user?.id, profileRefresh]);

  // تحميل قائمة الموظفين وإعداد اللقطات عند فتح لوحة الأدمن
  useEffect(() => {
    if (!supabase || !isAdmin || activeTab !== 'admin') return;
    setAdminLoading(true);
    supabase.from('profiles').select('id, full_name, role').order('full_name').then(({ data }) => {
      setAdminEmployees(data || []);
      setAdminLoading(false);
    }).catch(() => setAdminLoading(false));
    supabase.from('app_settings').select('value').eq('key', 'screenshot_interval_minutes').single().then(({ data }) => {
      const n = parseInt(data?.value, 10);
      if (n >= 1 && n <= 120) setAdminScreenshotInterval(n);
    }).catch(() => {});
  }, [isAdmin, activeTab, supabase]);

  // تحميل لقطات جميع الموظفين لمعرض التتبع (الأدمن فقط)
  useEffect(() => {
    if (!supabase || !isAdmin || activeTab !== 'monitor') return;
    setAdminGalleryLoading(true);
    const loadAdminGallery = async () => {
      const { data: rows } = await supabase.from('screenshots').select('id, file_path, time_display, is_virtual, user_id, created_at').order('created_at', { ascending: false }).limit(100);
      const list = rows || [];
      if (list.length === 0) {
        setAdminGalleryScreenshots([]);
        setAdminGalleryLoading(false);
        return;
      }
      const userIds = [...new Set(list.map(r => r.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name || 'بدون اسم']));
      const withUrls = list.map((row) => {
        const { data } = supabase.storage.from('screenshots').getPublicUrl(row.file_path);
        return { ...row, url: data?.publicUrl || null, full_name: nameMap[row.user_id] || 'موظف' };
      });
      setAdminGalleryScreenshots(withUrls);
      setAdminGalleryLoading(false);
    };
    loadAdminGallery();
  }, [isAdmin, activeTab, supabase]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) throw error;
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('fetch') || err?.name === 'TypeError') {
        setAuthError('تعذر الاتصال بالسيرفر. راجع إعدادات Supabase (Authentication → URL Configuration) أو تحقق من الاتصال.');
      } else {
        setAuthError(msg || 'فشل تسجيل الدخول');
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authEmail.split('@')[0] } } });
      if (error) throw error;
      setAuthError('');
      setAuthMode('login');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('fetch') || err?.name === 'TypeError') {
        setAuthError('تعذر الاتصال بالسيرفر. تحقق من: 1) إضافة رابط الموقع في Supabase (Authentication → URL Configuration) 2) المشروع غير متوقف 3) الاتصال بالإنترنت.');
      } else {
        setAuthError(msg || 'فشل إنشاء الحساب');
      }
    }
  };

  const refetchAdminEmployees = () => {
    if (!supabase) return;
    setAdminLoading(true);
    supabase.from('profiles').select('id, full_name, role').order('full_name').then(({ data }) => {
      setAdminEmployees(data || []);
      setAdminLoading(false);
    }).catch(() => setAdminLoading(false));
  };

  const openAddTaskForEmployee = (emp) => {
    setAdminSelectedForTask(emp);
    setAdminTaskText('');
    setShowAddTaskModal(true);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddEmpError('');
    if (!supabase || !newEmpEmail.trim() || !newEmpPassword.trim()) return;
    if (newEmpPassword.length < 6) {
      setAddEmpError('كلمة المرور 6 أحرف على الأقل');
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email: newEmpEmail.trim(),
        password: newEmpPassword,
        options: { data: { full_name: newEmpName.trim() || newEmpEmail.split('@')[0] } }
      });
      if (error) throw error;
      setAddEmpSuccess(true);
      setNewEmpEmail('');
      setNewEmpName('');
      setNewEmpPassword('');
      refetchAdminEmployees();
    } catch (err) {
      setAddEmpError(err?.message || 'فشل إنشاء الحساب');
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!supabase || !window.confirm(`تعطيل حساب "${emp.full_name || emp.id}"؟ لن يتمكن من الدخول بعد الآن. يمكنك إعادة تفعيله لاحقاً من قسم «موظفون معطّلون».`)) return;
    const { error } = await supabase.from('profiles').update({ role: 'محذوف' }).eq('id', emp.id);
    if (!error) refetchAdminEmployees();
  };

  const handleRestoreEmployee = async (emp) => {
    if (!supabase || !window.confirm(`إعادة تفعيل حساب "${emp.full_name || emp.id}"؟ سيتمكن من الدخول واستخدام التطبيق مرة أخرى.`)) return;
    const { error } = await supabase.from('profiles').update({ role: 'موظف' }).eq('id', emp.id);
    if (!error) refetchAdminEmployees();
  };

  const openProfileModal = () => {
    setProfileEditName(profile?.full_name ?? '');
    setProfileEditPhone(profile?.phone ?? '');
    setProfileAvatarFile(null);
    setProfileAvatarPreview(avatarDisplayUrl || '');
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!supabase || !user?.id || savingProfile) return;
    setSavingProfile(true);
    let avatarPath = profile?.avatar_url || null;
    if (profileAvatarFile) {
      const ext = profileAvatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, profileAvatarFile, { contentType: profileAvatarFile.type, upsert: true });
      if (!uploadErr) avatarPath = path;
    }
    const { error } = await supabase.from('profiles').update({
      full_name: profileEditName.trim() || null,
      phone: profileEditPhone.trim() || null,
      avatar_url: avatarPath
    }).eq('id', user.id);
    setSavingProfile(false);
    if (!error) {
      setProfileRefresh(r => r + 1);
      setShowProfileModal(false);
    }
  };

  const handleSaveScreenshotInterval = async () => {
    if (!supabase || adminScreenshotInterval < 1 || adminScreenshotInterval > 120) return;
    await supabase.from('app_settings').upsert({ key: 'screenshot_interval_minutes', value: String(adminScreenshotInterval) }, { onConflict: 'key' });
    setScreenshotIntervalMinutes(adminScreenshotInterval);
  };

  const handleRequestScreenshotForEmployee = async (emp) => {
    if (!supabase) return;
    setRequestingScreenshotFor(emp.id);
    await supabase.from('screenshot_requests').insert({ user_id: emp.id });
    setRequestingScreenshotFor(null);
  };

  const submitAddTaskForEmployee = async (e) => {
    e.preventDefault();
    if (!adminTaskText.trim() || !adminSelectedForTask?.id || !supabase) return;
    await supabase.from('tasks').insert({ user_id: adminSelectedForTask.id, text: adminTaskText.trim(), completed: false });
    setShowAddTaskModal(false);
    setAdminSelectedForTask(null);
    setAdminTaskText('');
  };

  const openActivityForEmployee = async (emp) => {
    setAdminSelectedForActivity(emp);
    setShowActivityModal(true);
    setAdminActivityData({ sessions: [], tasks: [], screenshots: [] });
    if (!supabase) return;
    const [sessionsRes, tasksRes, screensRes] = await Promise.all([
      supabase.from('work_sessions').select('date, start_time, end_time, duration, tasks_completed').eq('user_id', emp.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('tasks').select('id, text, completed').eq('user_id', emp.id).order('created_at', { ascending: false }),
      supabase.from('screenshots').select('id, file_path, time_display, is_virtual, created_at').eq('user_id', emp.id).order('created_at', { ascending: false }).limit(30)
    ]);
    const sessions = (sessionsRes.data || []).map(h => ({ ...h, dateDisplay: new Date(h.date + 'T12:00:00').toLocaleDateString('ar-EG') }));
    const tasks = tasksRes.data || [];
    const screenshotRows = screensRes.data || [];
    const screenshotsWithUrls = screenshotRows.map((row) => {
      const { data } = supabase.storage.from('screenshots').getPublicUrl(row.file_path);
      return { ...row, url: data?.publicUrl || null };
    });
    setAdminActivityData({ sessions, tasks, screenshots: screenshotsWithUrls });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setTasks([]);
    setHistory([]);
  };

  const syncTaskToSupabase = async (task, isDelete = false) => {
    if (!user?.id || !supabase) return;
    if (isDelete) {
      await supabase.from('tasks').delete().eq('id', task.id);
      return;
    }
    await supabase.from('tasks').upsert({ id: task.id, user_id: user.id, text: task.text, completed: task.completed, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // تحويل مدة من النص إلى ثوانٍ (يدعم "00:45:30" أو "2h 15m")
  const parseDurationToSeconds = (dur) => {
    if (!dur) return 0;
    const asTime = /^(\d+):(\d+):(\d+)$/.exec(dur);
    if (asTime) return parseInt(asTime[1], 10) * 3600 + parseInt(asTime[2], 10) * 60 + parseInt(asTime[3], 10);
    const asHM = /(\d+)\s*h[^\d]*(\d*)\s*m?/i.exec(dur);
    if (asHM) return (parseInt(asHM[1], 10) * 3600) + (parseInt(asHM[2] || '0', 10) * 60);
    return 0;
  };

  // إجمالي ساعات الموظف من آخر 7 أيام (من السجل)
  const getWeeklyTotalSeconds = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.reduce((sum, h) => {
      const d = new Date(h.date);
      if (isNaN(d.getTime())) return sum;
      if (d < weekAgo) return sum;
      return sum + parseDurationToSeconds(h.duration);
    }, 0);
  };
  const weeklyTotalSeconds = getWeeklyTotalSeconds();
  const weeklyDisplay = `${Math.floor(weeklyTotalSeconds / 3600)}:${Math.floor((weeklyTotalSeconds % 3600) / 60).toString().padStart(2, '0')}`;

  const startScreenMonitoring = async () => {
    setPermissionError(null);
    setIsPolicyBlocked(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Browser support missing");
      }

      // طلب الشاشة بالكامل (الكمبيوتر) وليس نافذة المتصفح فقط
      const baseOptions = {
        video: { cursor: "always", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };
      const monitorOptions = {
        ...baseOptions,
        video: { ...baseOptions.video, displaySurface: "monitor" },
        preferCurrentTab: false
      };
      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia(monitorOptions);
      } catch (_) {
        stream = await navigator.mediaDevices.getDisplayMedia(baseOptions);
      }
      
      setScreenStream(stream);
      setMonitoringEnabled(true);
      setMonitoringMode('real');
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      stream.getVideoTracks()[0].onended = () => {
        setMonitoringEnabled(false);
        setScreenStream(null);
      };
    } catch (err) {
      console.error("Screen capture blocked:", err);
      // Automatically switch to virtual mode on policy restriction
      setIsPolicyBlocked(true);
      setMonitoringMode('virtual');
      setMonitoringEnabled(true);
      setPermissionError("تم تفعيل 'وضع المحاكاة الآمن' لأن المتصفح يحظر تسجيل الشاشة داخل الإطارات.");
    }
  };

  const generateMockScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Draw a sophisticated mock screen
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);
    
    // Add some "UI" elements to the mock
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.fillRect(40, 40, 1200, 640);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1200, 640);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('نظام التتبع الذكي - لقطة شاشة افتراضية', 640, 320);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`وقت الالتقاط: ${new Date().toLocaleTimeString('ar-EG')}`, 640, 370);
    ctx.fillText(`الحالة: يتم تتبع النشاط برمجياً (وضع المحاكاة)`, 640, 400);

    // Decorative "Code" lines
    ctx.fillStyle = '#4ade80';
    for(let i=0; i<5; i++) {
        ctx.fillRect(100, 500 + (i*30), 200 + (Math.random()*400), 10);
    }

    const timeStr = new Date().toLocaleTimeString('ar-EG');
    const imageData = canvas.toDataURL('image/png');
    setScreenshots(prev => [{
      id: Date.now(),
      time: timeStr,
      data: imageData,
      isVirtual: true
    }, ...prev].slice(0, 10));
    saveScreenshotToSupabase(imageData, true, timeStr);
  };

  const takeScreenshot = () => {
    if (monitoringMode === 'virtual') {
      generateMockScreenshot();
      return;
    }
    
    if (!videoRef.current || !canvasRef.current || !screenStream) return;
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = 1280;
    canvasRef.current.height = 720;
    context.drawImage(videoRef.current, 0, 0, 1280, 720);
    
    const timeStr = new Date().toLocaleTimeString('ar-EG');
    const imageData = canvasRef.current.toDataURL('image/png');
    setScreenshots(prev => [{
      id: Date.now(),
      time: timeStr,
      data: imageData,
      isVirtual: false
    }, ...prev].slice(0, 10));
    saveScreenshotToSupabase(imageData, false, timeStr);
  };

  const saveScreenshotToSupabase = async (dataUrl, isVirtual, timeDisplay) => {
    if (!supabase || !user?.id) return;
    try {
      const path = `${user.id}/${Date.now()}.png`;
      const blob = await fetch(dataUrl).then(r => r.blob());
      const { error: upErr } = await supabase.storage.from('screenshots').upload(path, blob, { contentType: 'image/png', upsert: false });
      if (upErr) return;
      await supabase.from('screenshots').insert({ user_id: user.id, file_path: path, is_virtual: isVirtual, time_display: timeDisplay });
    } catch (_) {}
  };

  const callGemini = async (prompt) => {
    if (!GEMINI_URL) {
      setAiResponse("لم يتم ضبط مفتاح Gemini. أضف VITE_GEMINI_API_KEY في ملف .env");
      setShowAiModal(true);
      return;
    }
    setAiLoading(true);
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: "أنت مساعد إداري ذكي. ردودك احترافية وبالعربية." }] }
          })
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text);
        setShowAiModal(true);
        setAiLoading(false);
        return;
      } catch (err) {
        if (i === 4) {
          setAiResponse("عذراً، لم نتمكن من الاتصال بالذكاء الاصطناعي حالياً.");
          setShowAiModal(true);
          setAiLoading(false);
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };

  const handleToggleWork = () => {
    if (!isWorking) {
      setIsWorking(true);
      setStartTime(new Date().toLocaleTimeString());
    } else {
      const now = new Date();
      const dateISO = now.toISOString().slice(0, 10);
      const entry = {
        date: dateISO,
        dateDisplay: now.toLocaleDateString('ar-EG'),
        start: startTime,
        end: now.toLocaleTimeString(),
        duration: formatTime(elapsedTime),
        tasks: tasks.filter(t => t.completed).length
      };
      setHistory([entry, ...history]);
      if (user?.id && supabase) {
        supabase.from('work_sessions').insert({
          user_id: user.id,
          date: dateISO,
          start_time: entry.start,
          end_time: entry.end,
          duration: entry.duration,
          tasks_completed: entry.tasks
        }).then(() => {});
      }
      setIsWorking(false);
      setElapsedTime(0);
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setMonitoringEnabled(false);
    }
  };

  const showAuth = isSupabaseEnabled() && !user && !authLoading;
  const isBlocked = user && profile?.role === 'محذوف';
  const showApp = (!isSupabaseEnabled() || user) && !isBlocked;
  const activeEmployees = adminEmployees.filter(e => e.role !== 'محذوف');
  const disabledEmployees = adminEmployees.filter(e => e.role === 'محذوف');

  return (
    <div className="min-h-screen bg-slate-50 text-right flex flex-col items-center p-4 font-sans" dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <video ref={videoRef} autoPlay className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* شاشة تحميل Auth */}
      {authLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">جاري التحقق...</p>
          </div>
        </div>
      )}

      {/* شاشة تسجيل الدخول / إنشاء حساب (Supabase) */}
      {showAuth && (
        <div className="w-full max-w-md mt-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Clock className="w-8 h-8"/></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Trackify AI</h1>
              <p className="text-slate-500 text-sm">تسجيل الدخول للموظفين</p>
            </div>
          </div>
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Mail className="w-4 h-4"/> البريد الإلكتروني</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="name@company.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Lock className="w-4 h-4"/> كلمة المرور</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required minLength={6} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="••••••••" />
            </div>
            {authError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-right">
                <p className="text-rose-700 text-sm font-bold mb-3">{authError}</p>
                {authError.includes('السيرفر') && (
                  <div className="text-rose-600/90 text-xs space-y-2 mt-2">
                    <p className="font-bold">افعل التالي:</p>
                    <ol className="list-decimal list-inside space-y-1 font-medium">
                      <li>افتح <a href="https://supabase.com/dashboard/project/_/auth/url-configuration" target="_blank" rel="noopener noreferrer" className="underline">Supabase → Authentication → URL Configuration</a></li>
                      <li>في <strong>Site URL</strong> ضع: <code className="bg-white/80 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}</code></li>
                      <li>في <strong>Redirect URLs</strong> أضف سطراً: <code className="bg-white/80 px-1 rounded block mt-1">{typeof window !== 'undefined' ? window.location.origin + '/**' : ''}</code></li>
                      <li>احفظ (Save) ثم جرّب تسجيل الدخول مرة أخرى</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition">
              {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </form>
          <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} className="w-full mt-4 text-slate-500 text-sm font-medium hover:text-indigo-600">
            {authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب؟ تسجيل الدخول'}
          </button>
        </div>
      )}

      {/* حساب معطّل من الإدارة */}
      {isBlocked && (
        <div className="w-full max-w-md mt-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6"><ShieldAlert className="w-9 h-9"/></div>
          <h2 className="text-xl font-black text-slate-800 mb-2">حسابك معطّل</h2>
          <p className="text-slate-500 text-sm mb-6">تم تعطيل حسابك من لوحة الإدارة. تواصل مع المسؤول لإعادة التفعيل.</p>
          <button onClick={handleLogout} className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold">تسجيل الخروج</button>
        </div>
      )}

      {/* التطبيق الرئيسي */}
      {showApp && (
        <>
      {/* إشعار مهمة جديدة من الأدمن */}
      {newTaskNotification && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 animate-in">
          <div className="bg-amber-500 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3 border border-amber-400">
            <ListTodo className="w-6 h-6 flex-shrink-0 mt-0.5"/>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">مهمة جديدة من الإدارة</p>
              <p className="text-sm opacity-95 mt-1 truncate">{newTaskNotification}</p>
              <button onClick={() => setNewTaskNotification(null)} className="text-xs underline mt-2 opacity-90">إغلاق</button>
            </div>
            <button onClick={() => setNewTaskNotification(null)} className="p-1 rounded-lg hover:bg-white/20"><X className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 animate-in">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
              <span className="font-bold flex items-center gap-3 text-lg"><Sparkles className="w-6 h-6"/> تقرير المساعد الذكي</span>
              <button onClick={() => setShowAiModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 rounded-3xl p-6 text-slate-700 leading-relaxed whitespace-pre-wrap text-md border border-slate-100 shadow-inner max-h-[50vh] overflow-y-auto">
                {aiResponse}
              </div>
              <button onClick={() => setShowAiModal(false)} className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">فهمت، شكراً لك</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال: الملف الشخصي (الموظف يعدّل اسمه، جواله، صورته) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
              <span className="font-bold flex items-center gap-3 text-lg"><User className="w-6 h-6"/> الملف الشخصي</span>
              <button type="button" onClick={() => setShowProfileModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              <div className="flex flex-col items-center gap-3">
                <label className="block text-sm font-bold text-slate-700">الصورة الشخصية</label>
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                    {profileAvatarPreview ? (
                      <img src={profileAvatarPreview} alt="معاينة" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:bg-indigo-700">
                    <Camera className="w-4 h-4"/>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setProfileAvatarFile(f); setProfileAvatarPreview(URL.createObjectURL(f)); }
                    }} />
                  </label>
                </div>
                <p className="text-xs text-slate-500">اختر صورة (JPG, PNG)</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <input type="text" value={profileEditName} onChange={e => setProfileEditName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="الاسم كما تريده في التطبيق" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الجوال</label>
                <input type="tel" value={profileEditPhone} onChange={e => setProfileEditPhone(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="مثال: 05xxxxxxxx" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
                <button type="submit" disabled={savingProfile} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2">
                  {savingProfile ? <Loader2 className="w-5 h-5 animate-spin"/> : null} حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال: إضافة مهمة لموظف (أدمن) */}
      {showAddTaskModal && adminSelectedForTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
            <div className="bg-amber-600 p-6 flex justify-between items-center text-white">
              <span className="font-bold flex items-center gap-3 text-lg"><Plus className="w-6 h-6"/> إضافة مهمة لـ {adminSelectedForTask.full_name}</span>
              <button onClick={() => { setShowAddTaskModal(false); setAdminSelectedForTask(null); }} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={submitAddTaskForEmployee} className="p-6">
              <input value={adminTaskText} onChange={e => setAdminTaskText(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-amber-200 text-lg" placeholder="نص المهمة..." required />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setShowAddTaskModal(false); setAdminSelectedForTask(null); }} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال: إضافة موظف (أدمن) */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in">
            <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
              <span className="font-bold flex items-center gap-3 text-lg"><UserPlus className="w-6 h-6"/> إضافة موظف جديد</span>
              <button onClick={() => { setShowAddEmployeeModal(false); setAddEmpError(''); setAddEmpSuccess(false); }} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
            </div>
            {addEmpSuccess ? (
              <div className="p-6 text-center">
                <p className="text-emerald-600 font-bold mb-4">تم إنشاء الحساب بنجاح.</p>
                <p className="text-slate-500 text-sm mb-4">أعطِ الموظف البريد الإلكتروني وكلمة المرور المؤقتة لتسجيل الدخول.</p>
                <button onClick={() => { setShowAddEmployeeModal(false); setAddEmpSuccess(false); }} className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold">إغلاق</button>
              </div>
            ) : (
              <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="employee@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">اسم الموظف</label>
                  <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="اختياري" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">كلمة مرور مؤقتة (6+ أحرف)</label>
                  <input type="password" value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} required minLength={6} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-200" placeholder="••••••••" />
                </div>
                {addEmpError && <p className="text-rose-600 text-sm font-medium">{addEmpError}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAddEmployeeModal(false); setAddEmpError(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">إلغاء</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">إنشاء الحساب</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* مودال: متابعة نشاط موظف (أدمن) */}
      {showActivityModal && adminSelectedForActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 animate-in my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <span className="font-bold flex items-center gap-3 text-lg"><Activity className="w-6 h-6"/> متابعة نشاط: {adminSelectedForActivity.full_name}</span>
              <button onClick={() => { setShowActivityModal(false); setAdminSelectedForActivity(null); }} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2"><ListTodo className="w-5 h-5 text-indigo-600"/> المهام ({adminActivityData.tasks.length})</h3>
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {adminActivityData.tasks.length === 0 ? <p className="text-slate-400 text-sm">لا توجد مهام</p> : adminActivityData.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${t.completed ? 'text-emerald-500' : 'text-slate-300'}`}/>
                    <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-800 font-medium'}>{t.text}</span>
                  </div>
                ))}
              </div>
              <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600"/> جلسات العمل ({adminActivityData.sessions.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {adminActivityData.sessions.length === 0 ? <p className="text-slate-400 text-sm">لا توجد جلسات مسجلة</p> : adminActivityData.sessions.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">{h.dateDisplay || h.date}</p>
                      <p className="text-xs text-slate-500 font-mono">{h.start_time} — {h.end_time}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-indigo-600">{h.duration}</p>
                      <p className="text-[10px] text-slate-400">{h.tasks_completed} مهام منجزة</p>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="font-black text-slate-800 mb-3 mt-6 flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-600"/> لقطات الشاشة ({adminActivityData.screenshots.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                {adminActivityData.screenshots.length === 0 ? <p className="text-slate-400 text-sm col-span-full">لا توجد لقطات محفوظة</p> : adminActivityData.screenshots.map((s) => (
                  <div key={s.id} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group/card">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="block w-full h-28 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                        <img src={s.url} alt="لقطة" className="w-full h-28 object-cover" />
                      </a>
                    ) : <div className="w-full h-28 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">جاري التحميل</div>}
                    <div className="p-2 text-center">
                      <p className="text-xs font-bold text-slate-600">{s.time_display || '—'}</p>
                      {s.is_virtual && <span className="text-[10px] text-amber-600 font-bold">افتراضي</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-sm rounded-3xl mb-8 p-4 flex justify-between items-center border border-white sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 text-white"><Clock className="w-6 h-6"/></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Trackify AI</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">لوحة {displayName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'tasks', icon: ListTodo },
            { id: 'monitor', icon: Monitor },
            { id: 'history', icon: History },
            ...(isAdmin ? [{ id: 'admin', icon: ShieldCheck }] : [])
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <item.icon className="w-6 h-6"/>
            </button>
          ))}
        </div>
      </nav>

      <main className="w-full max-w-4xl pb-20">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* بطاقة ترحيب خاصة بكل موظف (تظهر عند تسجيل الدخول) */}
            {user && (
            <div className="bg-gradient-to-l from-indigo-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-xl text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur"><User className="w-9 h-9"/></div>
                <div>
                  <p className="text-white/80 text-sm font-bold">مرحباً،</p>
                  <h2 className="text-2xl font-black">{displayName}</h2>
                  <p className="text-white/70 text-xs font-medium mt-0.5">{displayRole} • {user.email || '—'}</p>
                </div>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">لوحتك الخاصة</p>
                <p className="text-3xl font-black">Trackify</p>
              </div>
            </div>
            )}

            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white text-center relative overflow-hidden group">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <h2 className="text-slate-400 mb-2 font-bold tracking-widest text-sm uppercase">وقت العمل المسجل اليوم</h2>
              <div className="text-8xl font-black text-slate-800 mb-10 tracking-tighter tabular-nums">{formatTime(elapsedTime)}</div>
              
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={handleToggleWork}
                  className={`px-16 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl transform active:scale-95 hover:-translate-y-1 ${isWorking ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
                >
                  {isWorking ? "إنهاء جلسة العمل" : "بدء جلسة العمل"}
                </button>

                {isWorking && (
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] w-full max-w-md border border-slate-100 mt-4 text-right shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-black text-slate-700 flex items-center gap-2">
                         <Monitor className="w-4 h-4 text-indigo-500"/> تتبع النشاط الآلي
                         {monitoringEnabled && (
                           <span className="flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold animate-pulse">
                             <Zap className="w-3 h-3"/> {monitoringMode === 'virtual' ? 'وضع المحاكاة' : 'نشط'}
                           </span>
                         )}
                      </span>
                      {!monitoringEnabled && (
                        <button onClick={startScreenMonitoring} className="text-xs bg-slate-800 text-white px-5 py-2 rounded-xl hover:bg-black transition-colors font-bold">تفعيل</button>
                      )}
                    </div>
                    {!monitoringEnabled && (
                      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                        عند ظهور نافذة المتصفح، اختر <strong className="text-slate-700">«الشاشة بالكامل»</strong> أو <strong className="text-slate-700">Entire screen</strong> لتسجيل شاشة الكمبيوتر وليس نافذة المتصفح فقط.
                      </p>
                    )}
                    {permissionError && (
                      <div className="bg-white p-4 rounded-2xl text-[11px] flex items-start gap-3 border border-slate-100 shadow-sm leading-relaxed">
                        <ShieldAlert className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 text-slate-500">
                          <p className="font-black text-slate-800 mb-1">تم تعديل نظام التتبع</p>
                          <p>{permissionError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
                <div className="flex justify-between items-start z-10">
                  <p className="opacity-60 text-xs font-bold uppercase tracking-widest">إجمالي ساعاتك الأسبوعية</p>
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-5xl font-black mt-6 z-10">{weeklyDisplay} <span className="text-lg font-medium opacity-40">ساعة</span></h3>
              </div>
              
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between group">
                <div>
                  <p className="text-slate-400 mb-1 text-xs font-bold uppercase tracking-widest">لقطات التتبع المسجلة</p>
                  <h3 className="text-5xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{screenshots.length}</h3>
                </div>
                <button 
                  disabled={aiLoading} 
                  onClick={() => callGemini(`حلل لي هذا اليوم: ${formatTime(elapsedTime)} عمل، ${screenshots.length} لقطة، و ${tasks.filter(t=>t.completed).length} مهام مكتملة.`)} 
                  className="bg-indigo-50 text-indigo-600 p-6 rounded-[2rem] hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-lg shadow-indigo-100 active:scale-90"
                >
                   {aiLoading ? <Loader2 className="animate-spin w-8 h-8"/> : <Sparkles className="w-8 h-8"/>}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-800">
                  <Eye className="text-indigo-600 w-8 h-8"/> 
                  معرض التتبع الرقمي
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  {isAdmin ? 'لقطات شاشة لجميع الموظفين' : 'سجل بصري لنشاط العمل المسجل في الجلسة الحالية'}
                </p>
              </div>
              {!isAdmin && isWorking && monitoringEnabled && (
                <button onClick={takeScreenshot} className="text-sm bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-bold">
                  <Camera className="w-5 h-5"/> التقاط صورة يدوية
                </button>
              )}
            </div>

            {isAdmin ? (
              adminGalleryLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin"/></div>
              ) : adminGalleryScreenshots.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
                  <Monitor className="w-20 h-20 mx-auto mb-6 opacity-5"/>
                  <p className="text-xl font-bold">لا توجد لقطات مسجلة من الموظفين</p>
                  <p className="text-sm mt-2 font-medium">ستظهر اللقطات هنا عندما يلتقط الموظفون صوراً من أجهزتهم</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {adminGalleryScreenshots.map(img => (
                    <div key={img.id} className="group relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      {img.url ? (
                        <a href={img.url} target="_blank" rel="noopener noreferrer" className="block w-full h-56 overflow-hidden cursor-pointer">
                          <img src={img.url} alt="لقطة" className="w-full h-56 object-cover" />
                        </a>
                      ) : <div className="w-full h-56 bg-slate-200 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400"/></div>}
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <span className="bg-slate-800/90 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-md">{img.full_name}</span>
                        {img.is_virtual && <span className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest">Simulated</span>}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex flex-col text-white">
                          <span className="font-black text-lg">{img.time_display || '—'}</span>
                          <span className="text-xs opacity-80">{img.full_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : screenshots.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
                <Monitor className="w-20 h-20 mx-auto mb-6 opacity-5"/>
                <p className="text-xl font-bold">لا توجد سجلات بصرية حالياً</p>
                <p className="text-sm mt-2 font-medium">سيقوم النظام بالتقاط الصور آلياً كل 10 دقائق فور تفعيل المراقبة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {screenshots.map(img => (
                  <div key={img.id} className="group relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <img src={img.data} alt="Screen" className="w-full h-56 object-cover" />
                    <div className="absolute top-4 right-4 z-20">
                       {img.isVirtual && <span className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg backdrop-blur-md border border-white/20 uppercase tracking-widest">Simulated</span>}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="flex justify-between items-center text-white">
                        <div className="flex flex-col">
                          <span className="font-black text-lg">{img.time}</span>
                          <span className="text-[10px] opacity-70 font-mono">ID: {img.id.toString().slice(-8)}</span>
                        </div>
                        <button onClick={() => setScreenshots(prev => prev.filter(s => s.id !== img.id))} className="bg-white/20 hover:bg-rose-500 p-2.5 rounded-xl transition-all backdrop-blur-md">
                          <Trash2 className="w-5 h-5 text-white"/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
             <h2 className="text-3xl font-black mb-10 text-slate-800 flex items-center gap-4">
               <ListTodo className="text-indigo-600 w-8 h-8"/> المهام الحالية
             </h2>
             <form onSubmit={async (e) => { 
               e.preventDefault(); 
               if (!newTask.trim()) return; 
               if (user?.id && supabase) { 
                 const { data } = await supabase.from('tasks').insert({ user_id: user.id, text: newTask.trim(), completed: false }).select().single(); 
                 if (data) setTasks([data, ...tasks]); 
               } else { 
                 setTasks([{ id: Date.now(), text: newTask.trim(), completed: false }, ...tasks]); 
               } 
               setNewTask(''); 
             }} className="flex gap-4 mb-10">
               <input value={newTask} onChange={e => setNewTask(e.target.value)} className="flex-1 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-slate-100 transition-all text-lg font-medium" placeholder="أضف مهمة جديدة للعمل..." />
               <button type="submit" className="bg-slate-900 text-white px-10 rounded-2xl hover:bg-black transition shadow-xl shadow-slate-200 active:scale-95"><Plus className="w-8 h-8"/></button>
             </form>
             <div className="space-y-4">
               {tasks.map(t => (
                 <div key={t.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group shadow-sm">
                   <div className="flex items-center gap-5">
                     <button onClick={() => {
                       const updated = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x);
                       setTasks(updated);
                       const task = updated.find(x => x.id === t.id);
                       if (task) syncTaskToSupabase(task);
                     }} className={`w-9 h-9 rounded-full border-2 transition-all duration-500 ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100' : 'border-slate-300 bg-white hover:border-indigo-400'}`}>
                       {t.completed && <CheckCircle className="w-6 h-6"/>}
                     </button>
                     <span className={`${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-bold text-xl'}`}>{t.text}</span>
                   </div>
                   <button onClick={() => { setTasks(tasks.filter(x => x.id !== t.id)); syncTaskToSupabase(t, true); }} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"><Trash2 className="w-6 h-6"/></button>
                 </div>
               ))}
             </div>
          </div>
        )}
        
        {activeTab === 'history' && (
           <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
             <h2 className="text-3xl font-black mb-10 text-slate-800">الأرشيف الزمني</h2>
             <div className="space-y-5">
               {history.map((h, i) => (
                 <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                       <History className="w-8 h-8" />
                     </div>
                     <div>
                       <p className="font-black text-slate-800 text-xl">{h.dateDisplay || h.date}</p>
                       <p className="text-sm text-slate-400 font-mono tracking-wider">{h.start} — {h.end}</p>
                     </div>
                   </div>
                   <div className="text-left bg-indigo-50 px-8 py-4 rounded-[1.5rem] border border-indigo-100 shadow-sm">
                     <p className="text-3xl font-black text-indigo-600 tracking-tighter">{h.duration}</p>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{h.tasks} Tasks Accomplished</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            <h2 className="text-3xl font-black mb-2 text-slate-800 flex items-center gap-4">
              <ShieldCheck className="text-amber-600 w-8 h-8"/> لوحة الأدمن
            </h2>
            <p className="text-slate-500 text-sm mb-6">إضافة مهام للموظفين ومتابعة نشاطهم ولقطات الشاشة</p>

            {/* التحكم في مدة اللقطة التلقائية */}
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600"/> مدة اللقطة التلقائية
              </h3>
              <p className="text-slate-500 text-sm mb-3">كل موظف يلتقط لقطة تلقائياً كل هذه المدة (بالدقائق) أثناء جلسة العمل مع تفعيل التتبع.</p>
              <div className="flex flex-wrap items-center gap-3">
                <select value={adminScreenshotInterval} onChange={e => setAdminScreenshotInterval(Number(e.target.value))} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-800">
                  {[1, 2, 5, 10, 15, 20, 30, 45, 60].map(m => (
                    <option key={m} value={m}>{m} دقيقة</option>
                  ))}
                </select>
                <button onClick={handleSaveScreenshotInterval} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">حفظ</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600"/> قائمة الموظفين
                <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">({activeEmployees.length})</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddEmployeeModal(true); setAddEmpError(''); setAddEmpSuccess(false); }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4"/> إضافة موظف
                </button>
                <button
                  onClick={refetchAdminEmployees}
                  disabled={adminLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {adminLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : null} تحديث القائمة
                </button>
              </div>
            </div>

            {adminLoading && activeEmployees.length === 0 ? (
              <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin"/></div>
            ) : activeEmployees.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                <p className="font-bold">لا يوجد موظفون مسجلون بعد</p>
                <p className="text-sm mt-1">سيظهرون هنا بعد إنشاء حساباتهم من صفحة تسجيل الدخول</p>
                <p className="text-xs mt-3 text-slate-400">تأكد من تنفيذ admin-policies.sql في Supabase حتى تتمكن من رؤية الجميع</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600"><User className="w-6 h-6"/></div>
                      <div>
                        <p className="font-black text-slate-800 text-lg">{emp.full_name || 'بدون اسم'}</p>
                        <p className="text-xs text-slate-500 font-medium">{emp.role === 'admin' ? 'أدمن' : (emp.role || 'موظف')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button onClick={() => openAddTaskForEmployee(emp)} className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 flex items-center gap-2">
                        <Plus className="w-4 h-4"/> إضافة مهمة
                      </button>
                      <button onClick={() => openActivityForEmployee(emp)} className="px-5 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-bold hover:bg-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4"/> متابعة النشاط
                      </button>
                      <button onClick={() => handleRequestScreenshotForEmployee(emp)} disabled={requestingScreenshotFor === emp.id} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2" title="طلب لقطة شاشة الآن من جهاز الموظف">
                        {requestingScreenshotFor === emp.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4"/>} لقطة الآن
                      </button>
                      {emp.role !== 'admin' && (
                        <button onClick={() => handleDeleteEmployee(emp)} className="px-5 py-2.5 rounded-xl bg-rose-100 text-rose-700 text-sm font-bold hover:bg-rose-200 flex items-center gap-2" title="تعطيل الحساب">
                          <UserMinus className="w-4 h-4"/> حذف
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* موظفون معطّلون - إعادة التفعيل */}
            {disabledEmployees.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-black text-slate-600 mb-4 flex items-center gap-2">
                  <UserMinus className="w-5 h-5"/> موظفون معطّلون ({disabledEmployees.length})
                </h3>
                <p className="text-slate-500 text-sm mb-4">يمكنك إعادة تفعيل أي حساب ليتمكن من الدخول مرة أخرى.</p>
                <div className="grid gap-3">
                  {disabledEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl border border-slate-200 opacity-90">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-300 rounded-xl flex items-center justify-center text-slate-500"><User className="w-5 h-5"/></div>
                        <div>
                          <p className="font-bold text-slate-600">{emp.full_name || 'بدون اسم'}</p>
                          <p className="text-xs text-slate-400">معطّل</p>
                        </div>
                      </div>
                      <button onClick={() => handleRestoreEmployee(emp)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-2" title="إعادة التفعيل">
                        <UserPlus className="w-4 h-4"/> إعادة التفعيل
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mt-auto mb-10 p-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[1.5rem] overflow-hidden bg-slate-900 flex items-center justify-center text-white shadow-2xl shrink-0">
            {avatarDisplayUrl ? <img src={avatarDisplayUrl} alt="" className="w-full h-full object-cover"/> : <User className="w-8 h-8"/>}
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-800 leading-none">{displayName}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.email || '—'}</p>
            {profile?.phone ? <p className="text-sm text-slate-500 mt-1" dir="ltr">{profile.phone}</p> : null}
          </div>
          {user && supabase && (
            <div className="flex items-center gap-2 mr-2">
              <button type="button" onClick={openProfileModal} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2 font-bold text-sm" title="الملف الشخصي">
                <User className="w-5 h-5"/> الملف الشخصي
              </button>
              <button onClick={handleLogout} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition flex items-center gap-2 font-bold text-sm" title="تسجيل الخروج">
                <LogOut className="w-5 h-5"/> خروج
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-3">
             <span className="text-[10px] bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full font-black tracking-widest">BUILD 2.0.1</span>
             <span className="text-[10px] bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black tracking-widest">SECURE SESSION</span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium italic">تم تفعيل وضع الأمان التلقائي لضمان استقرار التطبيق</p>
        </div>
      </footer>
        </>
      )}
    </div>
  );
};

export default App;

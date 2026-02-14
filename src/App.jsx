import React, { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Loader2 } from 'lucide-react';
import { supabase, isSupabaseEnabled } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import BlockedScreen from './components/BlockedScreen';
import AiModal from './components/modals/AiModal';
import ProfileModal from './components/modals/ProfileModal';
import AddTaskModal from './components/modals/AddTaskModal';
import AddEmployeeModal from './components/modals/AddEmployeeModal';
import ActivityModal from './components/modals/ActivityModal';
import EndSessionModal from './components/modals/EndSessionModal';
import SalaryEditModal from './components/modals/SalaryEditModal';
import ReauthModal from './components/modals/ReauthModal';
import ResetPasswordForm from './components/ResetPasswordForm';
import AppLayout from './components/AppLayout';
import MainContent from './components/MainContent';

// API Configuration - من الكود أو من .env (VITE_GEMINI_API_KEY)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDZjChAhYFIb9qKztVMuXJ1_rINiB_Xlvw"; 
const GEMINI_URL = apiKey ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}` : null;

const STORAGE_KEYS = { THEME: 'trackify_theme', SIDEBAR: 'trackify_sidebar_collapsed' };

const App = () => {
  // ─── القسم 1: حالة المصادقة (Auth) ───
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // لوحة الموظف: الاسم والدور من جدول profiles
  const [authLoading, setAuthLoading] = useState(isSupabaseEnabled());
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authJobTitle, setAuthJobTitle] = useState('');
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetPasswordNew, setResetPasswordNew] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [pendingActionAfterReauth, setPendingActionAfterReauth] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR) === 'true';
    } catch { return false; }
  });
  const [uiTheme, setUiTheme] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.THEME);
      return v === 'dark' || v === 'light' || v === 'auto' ? v : 'auto';
    } catch { return 'auto'; }
  });
  const [toastMessage, setToastMessage] = useState('');

  // ─── القسم 2: حالة العمل والتايمر والمهام والأرشيف ───
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // ─── القسم 3: حالة لوحة الأدمن ───
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
  const [userSavedScreenshots, setUserSavedScreenshots] = useState([]);
  const [userScreenshotsLoading, setUserScreenshotsLoading] = useState(false);
  const [employeeDailyHours, setEmployeeDailyHours] = useState({});
  const [employeeSalaryData, setEmployeeSalaryData] = useState({});
  const [adminHistory, setAdminHistory] = useState([]);
  const [adminHistoryLoading, setAdminHistoryLoading] = useState(false);
  const [adminHistoryError, setAdminHistoryError] = useState(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);
  const [activeUserIds, setActiveUserIds] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryEditEmployee, setSalaryEditEmployee] = useState(null);
  const [salaryEditValue, setSalaryEditValue] = useState('');

  // ─── القسم 4: حالة الملف الشخصي للموظف ───
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditName, setProfileEditName] = useState('');
  const [profileEditPhone, setProfileEditPhone] = useState('');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState(null);
  const [profileRefresh, setProfileRefresh] = useState(0);

  // ─── القسم 5: حالة المساعد الذكي (AI) ───
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [sessionEndReminder, setSessionEndReminder] = useState(false);
  const [taskReminderDismissed, setTaskReminderDismissed] = useState(false);
  const [adminDailySummary, setAdminDailySummary] = useState(null);

  // ─── القسم 6: حالة التتبع واللقطات (Screen Capture) ───
  const [screenStream, setScreenStream] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [monitoringMode, setMonitoringMode] = useState('real');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sessionEndReminderShownRef = useRef(false);

  // ─── القسم 7: القيم المشتقة (Derived) ───
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'موظف';
  const displayRole = profile?.role || 'موظف';
  const isAdmin = profile?.role === 'admin';

  // ─── القسم 8: Effects (التايمر، الإعدادات، Auth، البيانات) ───
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

  // تطبيق المظهر (فاتح / غامق / تلقائي) مع دعم تفضيل النظام
  useEffect(() => {
    const apply = () => {
      let theme = 'trackify';
      if (uiTheme === 'dark') theme = 'trackify-dark';
      else if (uiTheme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'trackify-dark';
      const root = document.body;
      if (root) root.setAttribute('data-theme', theme);
    };
    apply();
    if (uiTheme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => apply();
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [uiTheme]);

  // إظهار التوست ثم إخفاؤه بعد ثوانٍ
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(''), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

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

  // تذكير قبل إنهاء الجلسة (قبل ٥ دقائق من ٤ ساعات — مرة واحدة لكل جلسة)
  const FOUR_HOURS_SEC = 4 * 3600;
  const REMIND_BEFORE_SEC = 5 * 60;
  useEffect(() => {
    if (!isWorking) {
      sessionEndReminderShownRef.current = false;
      setSessionEndReminder(false);
      return;
    }
    if (elapsedTime >= FOUR_HOURS_SEC - REMIND_BEFORE_SEC && !sessionEndReminderShownRef.current) {
      sessionEndReminderShownRef.current = true;
      setSessionEndReminder(true);
    }
  }, [isWorking, elapsedTime]);

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

  // Supabase Auth: جلب الجلسة ومتابعة تغيير تسجيل الدخول + كشف رابط استعادة كلمة المرور
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setAuthLoading(false);
      return;
    }
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const isRecovery = /type=recovery/.test(hash);
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session && isRecovery) {
          setShowResetPasswordForm(true);
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      const h = typeof window !== 'undefined' ? window.location.hash : '';
      if (session && /type=recovery/.test(h)) {
        setShowResetPasswordForm(true);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // تحميل أرشيف جلسات الموظف (يُستدعى عند الدخول وعند الضغط على «تحديث» في السجل)
  const loadUserHistory = useCallback(async () => {
    if (!user?.id || !supabase) return;
    const { data } = await supabase.from('work_sessions').select('id, date, start_time as start, end_time as end, duration, tasks_completed as tasks').eq('user_id', user.id).order('created_at', { ascending: false });
    setHistory((data || []).map(h => ({ ...h, dateDisplay: new Date((h.date || '') + 'T12:00:00').toLocaleDateString('ar-EG') })));
  }, [user?.id, supabase]);

  const handleRefreshUserHistory = useCallback(async () => {
    setUserHistoryLoading(true);
    await loadUserHistory();
    setUserHistoryLoading(false);
  }, [loadUserHistory]);

  // تحميل المهام والأرشيف وملف الموظف من Supabase عند وجود مستخدم
  useEffect(() => {
    if (!user?.id || !supabase) return;
    const loadTasks = async () => {
      const { data } = await supabase.from('tasks').select('id, text, completed').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data?.length) setTasks(data.map(t => ({ id: t.id, text: t.text, completed: t.completed })));
    };
    const loadProfile = async () => {
      const { data } = await supabase.from('profiles').select('full_name, role, avatar_url, phone, job_title').eq('id', user.id).maybeSingle();
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
    loadUserHistory();
    loadProfile();
  }, [user?.id, profileRefresh, loadUserHistory]);

  const getWorkingDaysInMonth = (year, month) => {
    const d = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    let count = 0;
    for (let day = 1; day <= lastDay; day++) {
      d.setDate(day);
      if (d.getDay() !== 5) count++;
    }
    return count;
  };

  // تحميل قائمة الموظفين وساعاتهم اليومية والرواتب عند فتح لوحة الأدمن
  useEffect(() => {
    if (!supabase || !isAdmin || activeTab !== 'admin') return;
    setAdminLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
    Promise.all([
      supabase.from('profiles').select('id, full_name, role, monthly_salary, phone, job_title').order('full_name'),
      supabase.from('work_sessions').select('user_id, duration').eq('date', today),
      supabase.from('work_sessions').select('user_id, duration').gte('date', monthStart).lte('date', monthEnd),
      supabase.from('app_settings').select('value').eq('key', 'screenshot_interval_minutes').single()
    ]).then(([profilesRes, todaySessionsRes, monthSessionsRes, settingsRes]) => {
      setAdminEmployees(profilesRes.data || []);
      const todaySessions = todaySessionsRes.data || [];
      const hoursMap = {};
      todaySessions.forEach((s) => {
        const sec = parseDurationToSeconds(s.duration);
        hoursMap[s.user_id] = (hoursMap[s.user_id] || 0) + sec;
      });
      setEmployeeDailyHours(hoursMap);
      const monthSessions = monthSessionsRes.data || [];
      const workingDays = getWorkingDaysInMonth(now.getFullYear(), now.getMonth() + 1);
      const expectedHours = workingDays * 4;
      const salaryByUser = {};
      monthSessions.forEach((s) => {
        const sec = parseDurationToSeconds(s.duration);
        salaryByUser[s.user_id] = (salaryByUser[s.user_id] || 0) + sec;
      });
      const salaryData = {};
      (profilesRes.data || []).forEach((emp) => {
        const actualSeconds = salaryByUser[emp.id] || 0;
        const actualHours = actualSeconds / 3600;
        const monthlySalary = emp.monthly_salary != null ? parseFloat(emp.monthly_salary) : null;
        let calculated = null;
        if (monthlySalary != null && expectedHours > 0) {
          const ratio = Math.min(actualHours / expectedHours, 1);
          calculated = Math.round(monthlySalary * ratio * 100) / 100;
        }
        salaryData[emp.id] = { monthlySalary, actualHours, expectedHours, calculated, workingDays };
      });
      setEmployeeSalaryData(salaryData);
      const n = parseInt(settingsRes.data?.value, 10);
      if (n >= 1 && n <= 120) setAdminScreenshotInterval(n);
      setAdminLoading(false);
    }).catch(() => setAdminLoading(false));
  }, [isAdmin, activeTab, supabase]);

  const formatSecondsToHM = (sec) => sec == null || sec === 0 ? '0:00' : `${Math.floor(sec / 3600)}:${Math.floor((sec % 3600) / 60).toString().padStart(2, '0')}`;

  // تحميل لقطات الموظف المحفوظة (للعرض في التتبع عند فتح التبويب)
  useEffect(() => {
    if (!supabase || !user?.id || isAdmin || activeTab !== 'monitor') return;
    setUserScreenshotsLoading(true);
    const loadUserScreenshots = async () => {
      const { data: rows } = await supabase.from('screenshots').select('id, file_path, time_display, is_virtual, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2000);
      const list = rows || [];
      const withUrls = list.map((row) => {
        const { data } = supabase.storage.from('screenshots').getPublicUrl(row.file_path);
        return { ...row, url: data?.publicUrl || null };
      });
      setUserSavedScreenshots(withUrls);
      setUserScreenshotsLoading(false);
    };
    loadUserScreenshots();
  }, [supabase, user?.id, isAdmin, activeTab]);

  // تحميل لقطات جميع الموظفين لمعرض التتبع (الأدمن فقط)
  useEffect(() => {
    if (!supabase || !isAdmin || activeTab !== 'monitor') return;
    setAdminGalleryLoading(true);
    const loadAdminGallery = async () => {
      const { data: rows } = await supabase.from('screenshots').select('id, file_path, time_display, is_virtual, user_id, created_at').order('created_at', { ascending: false }).limit(5000);
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

  // تحميل الأرشيف الزمني لجميع الموظفين (الأدمن) + مزامنة فورية
  const loadAdminHistory = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setAdminHistoryLoading(true);
    setAdminHistoryError(null);
    const { data: rows, error } = await supabase
      .from('work_sessions')
      .select('id, date, start_time, end_time, duration, tasks_completed, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      setAdminHistoryError(error.message || 'فشل تحميل الأرشيف');
      setAdminHistory([]);
      setAdminHistoryLoading(false);
      return;
    }
    if (!rows?.length) {
      setAdminHistory([]);
      setAdminHistoryLoading(false);
      return;
    }
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    const nameMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name || 'بدون اسم']));
    const list = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      date: r.date,
      start: r.start_time,
      end: r.end_time,
      duration: r.duration,
      tasks: r.tasks_completed,
      dateDisplay: new Date(r.date + 'T12:00:00').toLocaleDateString('ar-EG'),
      full_name: nameMap[r.user_id] || 'موظف',
    }));
    setAdminHistory(list);
    setAdminHistoryLoading(false);
  }, [supabase, isAdmin]);

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    loadAdminHistory();
    const loadActive = async () => {
      const { data, error } = await supabase.from('active_work_sessions').select('user_id');
      if (error) return;
      const raw = data ?? [];
      const list = Array.isArray(raw) ? raw : [raw];
      const ids = list.map((r) => (r && r.user_id) ? String(r.user_id) : null).filter(Boolean);
      setActiveUserIds(ids);
    };
    loadActive();
    const ch = supabase
      .channel('work_sessions_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_sessions' }, () => loadAdminHistory());
    ch.subscribe();
    const chActive = supabase
      .channel('active_work_sessions_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_work_sessions' }, () => loadActive());
    chActive.subscribe();
    return () => {
      supabase.removeChannel(ch);
      supabase.removeChannel(chActive);
    };
  }, [supabase, isAdmin, loadAdminHistory]);

  // ملخص يومي للأدمن عند فتح لوحة التحكم أو لوحة الإدارة
  useEffect(() => {
    if (!supabase || !isAdmin || (activeTab !== 'dashboard' && activeTab !== 'admin')) {
      setAdminDailySummary(null);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabase.from('active_work_sessions').select('user_id'),
      supabase.from('work_sessions').select('user_id, duration').eq('date', today),
      supabase.from('profiles').select('id, full_name, role').neq('role', 'محذوف'),
    ]).then(([activeRes, sessionsRes, profilesRes]) => {
      const activeIds = new Set((activeRes.data || []).map((r) => r.user_id));
      const sessionUserIds = new Set((sessionsRes.data || []).map((r) => r.user_id));
      const employees = (profilesRes.data || []).filter((p) => p.role !== 'admin');
      const noSessionNames = employees.filter((e) => !sessionUserIds.has(e.id)).map((e) => e.full_name || 'بدون اسم');
      const parseDur = (dur) => {
        if (!dur) return 0;
        const m = /^(\d+):(\d+):(\d+)$/.exec(dur);
        if (m) return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
        return 0;
      };
      let totalSec = 0;
      (sessionsRes.data || []).forEach((s) => { totalSec += parseDur(s.duration); });
      const h = Math.floor(totalSec / 3600);
      const min = Math.floor((totalSec % 3600) / 60);
      setAdminDailySummary({
        activeCount: activeIds.size,
        noSessionNames,
        totalFormatted: `${h}:${min.toString().padStart(2, '0')}`,
      });
    }).catch(() => setAdminDailySummary(null));
  }, [supabase, isAdmin, activeTab]);

  // عند فتح تبويب السجل كأدمن: تحديث الأرشيف وقائمة النشطين
  useEffect(() => {
    if (activeTab !== 'history' || !isAdmin || !supabase) return;
    loadAdminHistory();
    supabase.from('active_work_sessions').select('user_id').then(({ data, error }) => {
      if (error) return;
      const raw = data ?? [];
      const list = Array.isArray(raw) ? raw : [raw];
      setActiveUserIds(list.map((r) => (r && r.user_id) ? String(r.user_id) : null).filter(Boolean));
    });
  }, [activeTab, isAdmin, supabase, loadAdminHistory]);

  // ─── القسم 9: Handlers (المصادقة، الأدمن، الملف الشخصي، المهام، اللقطات، العمل) ───
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
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            full_name: authFullName.trim() || authEmail.split('@')[0],
            phone: authPhone.trim(),
            job_title: authJobTitle.trim()
          }
        }
      });
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setForgotPasswordSuccess(false);
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo });
      if (error) throw error;
      setForgotPasswordSuccess(true);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('fetch') || err?.name === 'TypeError') {
        setAuthError('تعذر الاتصال بالسيرفر. تحقق من إعدادات Supabase واتصال الإنترنت.');
      } else {
        setAuthError(msg || 'فشل إرسال رابط استعادة كلمة المرور');
      }
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setResetPasswordError('');
    if (resetPasswordNew.length < 6) {
      setResetPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (resetPasswordNew !== resetPasswordConfirm) {
      setResetPasswordError('كلمة المرور وتأكيدها غير متطابقتين');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: resetPasswordNew });
      if (error) throw error;
      setResetPasswordSuccess(true);
      setResetPasswordNew('');
      setResetPasswordConfirm('');
      setTimeout(() => setShowResetPasswordForm(false), 2000);
    } catch (err) {
      setResetPasswordError(err?.message || 'فشل تحديث كلمة المرور');
    }
  };

  const refetchAdminEmployees = () => {
    if (!supabase) return;
    setAdminLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
    Promise.all([
      supabase.from('profiles').select('id, full_name, role, monthly_salary, phone, job_title').order('full_name'),
      supabase.from('work_sessions').select('user_id, duration').eq('date', today),
      supabase.from('work_sessions').select('user_id, duration').gte('date', monthStart).lte('date', monthEnd)
    ]).then(([profilesRes, todaySessionsRes, monthSessionsRes]) => {
      setAdminEmployees(profilesRes.data || []);
      const todaySessions = todaySessionsRes.data || [];
      const hoursMap = {};
      todaySessions.forEach((s) => {
        const sec = parseDurationToSeconds(s.duration);
        hoursMap[s.user_id] = (hoursMap[s.user_id] || 0) + sec;
      });
      setEmployeeDailyHours(hoursMap);
      const monthSessions = monthSessionsRes.data || [];
      const workingDays = getWorkingDaysInMonth(now.getFullYear(), now.getMonth() + 1);
      const expectedHours = workingDays * 4;
      const salaryByUser = {};
      monthSessions.forEach((s) => {
        const sec = parseDurationToSeconds(s.duration);
        salaryByUser[s.user_id] = (salaryByUser[s.user_id] || 0) + sec;
      });
      const salaryData = {};
      (profilesRes.data || []).forEach((emp) => {
        const actualSeconds = salaryByUser[emp.id] || 0;
        const actualHours = actualSeconds / 3600;
        const monthlySalary = emp.monthly_salary != null ? parseFloat(emp.monthly_salary) : null;
        let calculated = null;
        if (monthlySalary != null && expectedHours > 0) {
          const ratio = Math.min(actualHours / expectedHours, 1);
          calculated = Math.round(monthlySalary * ratio * 100) / 100;
        }
        salaryData[emp.id] = { monthlySalary, actualHours, expectedHours, calculated, workingDays };
      });
      setEmployeeSalaryData(salaryData);
      setAdminLoading(false);
    }).catch(() => setAdminLoading(false));
  };

  const openAddTaskForEmployee = (emp) => {
    setAdminSelectedForTask(emp);
    setAdminTaskText('');
    setShowAddTaskModal(true);
  };

  const openSalaryEdit = (emp) => {
    setSalaryEditEmployee(emp);
    setSalaryEditValue(emp.monthly_salary != null ? String(emp.monthly_salary) : '');
    setShowSalaryModal(true);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!supabase || !salaryEditEmployee) return;
    const val = parseFloat(salaryEditValue);
    if (isNaN(val) || val < 0) return;
    const { error } = await supabase.from('profiles').update({ monthly_salary: val }).eq('id', salaryEditEmployee.id);
    if (!error) {
      setAdminEmployees(prev => prev.map(e => e.id === salaryEditEmployee.id ? { ...e, monthly_salary: val } : e));
      setEmployeeSalaryData(prev => {
        const sal = prev[salaryEditEmployee.id] || {};
        const expectedHours = sal.expectedHours || 0;
        const actualHours = sal.actualHours || 0;
        let calculated = null;
        if (val > 0 && expectedHours > 0) {
          const ratio = Math.min(actualHours / expectedHours, 1);
          calculated = Math.round(val * ratio * 100) / 100;
        }
        return { ...prev, [salaryEditEmployee.id]: { ...sal, monthlySalary: val, calculated } };
      });
      setShowSalaryModal(false);
      setSalaryEditEmployee(null);
    }
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
    if (!supabase) return;
    const { isConfirmed } = await Swal.fire({
      title: 'تعطيل الحساب؟',
      html: `تعطيل حساب "<strong>${emp.full_name || emp.id}</strong>"؟ لن يتمكن من الدخول بعد الآن. يمكنك إعادة تفعيله لاحقاً من قسم «موظفون معطّلون».`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تعطيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
    });
    if (!isConfirmed) return;
    const { error } = await supabase.from('profiles').update({ role: 'محذوف' }).eq('id', emp.id);
    if (!error) {
      Swal.fire({ title: 'تم التعطيل', icon: 'success', confirmButtonText: 'حسناً' });
      refetchAdminEmployees();
    }
  };

  const handleRestoreEmployee = async (emp) => {
    if (!supabase) return;
    const { isConfirmed } = await Swal.fire({
      title: 'إعادة التفعيل؟',
      html: `إعادة تفعيل حساب "<strong>${emp.full_name || emp.id}</strong>"؟ سيتمكن من الدخول واستخدام التطبيق مرة أخرى.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، إعادة التفعيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#059669',
    });
    if (!isConfirmed) return;
    const { error } = await supabase.from('profiles').update({ role: 'موظف' }).eq('id', emp.id);
    if (!error) {
      Swal.fire({ title: 'تم إعادة التفعيل', icon: 'success', confirmButtonText: 'حسناً' });
      refetchAdminEmployees();
    }
  };

  const openProfileModal = () => {
    setProfileEditName(profile?.full_name ?? '');
    setProfileEditPhone(profile?.phone ?? '');
    setProfileAvatarFile(null);
    setProfileAvatarPreview(avatarDisplayUrl || '');
    setShowProfileModal(true);
  };

  const handleProfileSaveRequest = (e) => {
    e.preventDefault();
    setPendingActionAfterReauth(() => () => handleSaveProfile());
    setShowReauthModal(true);
  };

  const handleReauthConfirm = async (password) => {
    if (!supabase || !user?.email) throw new Error('الجلسة غير متوفرة');
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (error) throw new Error('كلمة المرور غير صحيحة');
    const action = pendingActionAfterReauth;
    setPendingActionAfterReauth(null);
    setShowReauthModal(false);
    if (action && typeof action === 'function') {
      const run = action();
      if (typeof run === 'function') await run();
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault?.();
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
      setProfile(prev => ({ ...(prev || {}), full_name: profileEditName.trim() || prev?.full_name, phone: profileEditPhone.trim() ?? prev?.phone, avatar_url: avatarPath }));
      if (avatarPath) {
        const { data: signed } = await supabase.storage.from('avatars').createSignedUrl(avatarPath, 86400);
        setAvatarDisplayUrl(signed?.signedUrl || null);
      } else {
        setAvatarDisplayUrl(null);
      }
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
      supabase.from('work_sessions').select('date, start_time, end_time, duration, tasks_completed, work_summary').eq('user_id', emp.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('tasks').select('id, text, completed').eq('user_id', emp.id).order('created_at', { ascending: false }),
      supabase.from('screenshots').select('id, file_path, time_display, is_virtual, created_at').eq('user_id', emp.id).order('created_at', { ascending: false }).limit(2000)
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

  // إجمالي ساعات الموظف اليوم (من السجل + الجلسة الحالية)
  const getDailyTotalSeconds = () => {
    const today = new Date().toISOString().slice(0, 10);
    const fromHistory = history
      .filter((h) => String(h.date).slice(0, 10) === today)
      .reduce((sum, h) => sum + parseDurationToSeconds(h.duration), 0);
    const currentSession = isWorking ? elapsedTime : 0;
    return fromHistory + currentSession;
  };
  const dailyTotalSeconds = getDailyTotalSeconds();
  const dailyDisplay = `${Math.floor(dailyTotalSeconds / 3600)}:${Math.floor((dailyTotalSeconds % 3600) / 60).toString().padStart(2, '0')}`;

  const requestComputerScreenOnly = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("NOT_SUPPORTED");
    }
    const options = {
      video: {
        cursor: "always",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        displaySurface: "monitor",
        selfBrowserSurface: "exclude",
      },
      audio: false,
      preferCurrentTab: false,
    };
    const stream = await navigator.mediaDevices.getDisplayMedia(options);
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings?.();
    const surface = settings?.displaySurface;
    if (surface === "window" || surface === "browser") {
      track.stop();
      throw new Error("WRONG_SOURCE");
    }
    return stream;
  };

  const handleStartSessionRequest = async () => {
    try {
      const stream = await requestComputerScreenOnly();
      setScreenStream(stream);
      setMonitoringEnabled(true);
      setMonitoringMode('real');
      if (videoRef.current) videoRef.current.srcObject = stream;
      stream.getVideoTracks()[0].onended = () => {
        setMonitoringEnabled(false);
        setScreenStream(null);
      };
      setIsWorking(true);
      setStartTime(new Date().toLocaleTimeString());
      if (user?.id && supabase) {
        supabase.from('active_work_sessions').upsert({ user_id: user.id }, { onConflict: 'user_id' }).then(() => {});
      }
    } catch (err) {
      console.error("Screen share:", err);
      const name = err?.name || err?.message || "";
      if (name.includes("NotAllowedError") || name.includes("Permission")) {
        await Swal.fire({
          title: "تم إلغاء البدء",
          html: "يجب مشاركة <strong>شاشة الكمبيوتر</strong> لبدء الجلسة. الجلسة لا تبدأ بدون مشاركة الشاشة.",
          icon: "warning",
          confirmButtonText: "حسناً",
        });
      } else if (err?.message === "WRONG_SOURCE") {
        await Swal.fire({
          title: "اختيار خاطئ",
          html: "يجب اختيار <strong>الشاشة بالكامل</strong> (الكمبيوتر) وليس نافذة أو تاب المتصفح. جرّب مرة أخرى.",
          icon: "error",
          confirmButtonText: "حسناً",
        });
      } else if (err?.message === "NOT_SUPPORTED") {
        await Swal.fire({
          title: "غير مدعوم",
          text: "متصفحك لا يدعم مشاركة الشاشة. استخدم Chrome أو Edge.",
          icon: "error",
          confirmButtonText: "حسناً",
        });
      } else {
        await Swal.fire({
          title: "فشل البدء",
          html: "يجب مشاركة <strong>شاشة الكمبيوتر</strong> لبدء الجلسة. الجلسة لا تبدأ بدون مشاركة الشاشة.",
          icon: "error",
          confirmButtonText: "حسناً",
        });
      }
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current || !screenStream) return;
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = 1280;
    canvasRef.current.height = 720;
    context.drawImage(videoRef.current, 0, 0, 1280, 720);
    
    const now = new Date();
    const timeStr = now.toLocaleDateString('ar-EG') + ' ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const imageData = canvasRef.current.toDataURL('image/png');
    setScreenshots(prev => [{
      id: Date.now(),
      time: timeStr,
      data: imageData,
      isVirtual: false
    }, ...prev].slice(0, 2000));
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

  // استدعاء Gemini وإرجاع النص فقط (للاستخدام في الاقتراحات أو التحليل الأسبوعي)
  const getGeminiResponse = useCallback(async (prompt) => {
    if (!GEMINI_URL) return null;
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
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (_) {
        if (i === 4) return null;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
    return null;
  }, []);

  const callGemini = useCallback(async (prompt) => {
    if (!GEMINI_URL) {
      setAiResponse("لم يتم ضبط مفتاح Gemini. أضف VITE_GEMINI_API_KEY في ملف .env");
      setShowAiModal(true);
      return;
    }
    setAiLoading(true);
    try {
      const text = await getGeminiResponse(prompt);
      setAiResponse(text || "عذراً، لم نتمكن من الاتصال بالذكاء الاصطناعي حالياً.");
      setShowAiModal(true);
    } finally {
      setAiLoading(false);
    }
  }, [getGeminiResponse]);

  // تحليل أسبوعي للفريق (آخر 7 أيام)
  const callGeminiWeeklySummary = useCallback(async () => {
    if (!GEMINI_URL || !supabase) {
      setAiResponse("لم يتم ضبط مفتاح Gemini أو الاتصال بقاعدة البيانات.");
      setShowAiModal(true);
      return;
    }
    setAiLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const dateFrom = weekAgo.toISOString().slice(0, 10);
      const { data } = await supabase.from('work_sessions').select('user_id, duration, tasks_completed').gte('date', dateFrom).lte('date', today);
      const byUser = {};
      (data || []).forEach((s) => {
        const uid = s.user_id;
        if (!byUser[uid]) byUser[uid] = { seconds: 0, tasks: 0 };
        byUser[uid].seconds += parseDurationToSeconds(s.duration);
        byUser[uid].tasks += Number(s.tasks_completed) || 0;
      });
      const active = adminEmployees.filter((e) => e.role !== 'محذوف');
      const lines = active.map((emp) => {
        const d = byUser[emp.id];
        const sec = d ? d.seconds : 0;
        const tasks = d ? d.tasks : 0;
        return `${emp.full_name || 'بدون اسم'} (${emp.job_title || 'موظف'}): ساعات ${formatSecondsToHM(sec)}، مهام منجزة ${tasks}`;
      });
      const prompt = `تلخيص أسبوعي لأداء الفريق (آخر 7 أيام):\n\n${lines.join('\n')}\n\nقدم تلخيصاً موجزاً لأداء الفريق مع نقاط قوة واقتراحات للتحسين.`;
      await callGemini(prompt);
    } catch (_) {
      setAiResponse("فشل تحميل بيانات الأسبوع. تأكد من الاتصال بقاعدة البيانات.");
      setShowAiModal(true);
      setAiLoading(false);
    }
  }, [supabase, adminEmployees, callGemini, formatSecondsToHM]);

  // اقتراح مهام لموظف حسب المسمى (لنموذج إضافة مهمة)
  const suggestTasksForEmployee = useCallback(async (emp) => {
    const text = await getGeminiResponse(
      `اقترح 5 مهام عمل مناسبة لموظف بمسمى وظيفي: ${emp?.job_title || 'موظف'}. أعد القائمة فقط: سطر واحد لكل مهمة، تبدأ برقم ثم نقطة ثم نص المهمة، بدون عناوين أو شرح إضافي.`
    );
    if (!text) return [];
    const lines = text
      .split(/\n/)
      .map((s) => s.replace(/^[\d\u0660-\u0669.\-*\s]+/, '').trim())
      .filter(Boolean);
    return lines.slice(0, 5);
  }, [getGeminiResponse]);

  const doEndSession = (completedTasksCount, workItems = []) => {
    const now = new Date();
    const dateISO = now.toISOString().slice(0, 10);
    const entry = {
      date: dateISO,
      dateDisplay: now.toLocaleDateString('ar-EG'),
      start: startTime,
      end: now.toLocaleTimeString(),
      duration: formatTime(elapsedTime),
      tasks: completedTasksCount
    };
    setHistory([entry, ...history]);
    if (user?.id && supabase) {
      supabase.from('active_work_sessions').delete().eq('user_id', user.id).then(() => {});
      supabase.from('work_sessions').insert({
        user_id: user.id,
        date: dateISO,
        start_time: entry.start,
        end_time: entry.end,
        duration: entry.duration,
        tasks_completed: completedTasksCount,
        work_summary: workItems
      }).then(() => {});
    }
    setIsWorking(false);
    setElapsedTime(0);
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }
    setMonitoringEnabled(false);
    setShowEndSessionModal(false);
  };

  const handleConfirmEndSession = async (workItems) => {
    if (!workItems?.length) return;
    const newTasks = workItems.map(text => ({ id: crypto.randomUUID(), text, completed: true }));
    setTasks([...newTasks, ...tasks]);
    if (user?.id && supabase) {
      for (const t of newTasks) {
        await supabase.from('tasks').insert({ id: t.id, user_id: user.id, text: t.text, completed: true });
      }
    }
    doEndSession(newTasks.length + tasks.filter(t => t.completed).length, workItems);
  };

  const handleToggleWork = () => {
    if (!isWorking) {
      handleStartSessionRequest();
    } else {
      setShowEndSessionModal(true);
    }
  };

  const showAuth = isSupabaseEnabled() && !user && !authLoading;
  const isBlocked = user && profile?.role === 'محذوف';
  const showApp = (!isSupabaseEnabled() || user) && !isBlocked;
  const activeEmployees = adminEmployees.filter(e => e.role !== 'محذوف');
  const disabledEmployees = adminEmployees.filter(e => e.role === 'محذوف');

  // ─── القسم 10: JSX ───
  return (
    <div className="min-h-screen bg-base-200 text-right flex flex-col items-center p-4 font-sans" dir="rtl">
      <video ref={videoRef} autoPlay className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── شاشة تحميل المصادقة ─── */}
      {authLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-base-200/95 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-5">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-base-content/70 font-bold">جاري التحقق...</p>
          </div>
        </div>
      )}

      {showResetPasswordForm && user && (
        <ResetPasswordForm
          resetPasswordNew={resetPasswordNew}
          setResetPasswordNew={setResetPasswordNew}
          resetPasswordConfirm={resetPasswordConfirm}
          setResetPasswordConfirm={setResetPasswordConfirm}
          resetPasswordError={resetPasswordError}
          resetPasswordSuccess={resetPasswordSuccess}
          onSubmit={handleSetNewPassword}
        />
      )}

      {/* ─── شاشة تسجيل الدخول / إنشاء حساب ─── */}
      {showAuth && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-base-200 via-primary/5 to-base-200 overflow-auto">
          <AuthScreen
          authMode={authMode}
          authEmail={authEmail}
          authPassword={authPassword}
          authFullName={authFullName}
          authPhone={authPhone}
          authJobTitle={authJobTitle}
          authError={authError}
          forgotPasswordSuccess={forgotPasswordSuccess}
          setAuthEmail={setAuthEmail}
          setAuthPassword={setAuthPassword}
          setAuthFullName={setAuthFullName}
          setAuthPhone={setAuthPhone}
          setAuthJobTitle={setAuthJobTitle}
          setAuthMode={setAuthMode}
          setAuthError={setAuthError}
          setForgotPasswordSuccess={setForgotPasswordSuccess}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
        />
        </div>
      )}

      {/* ─── شاشة الحساب المعطّل ─── */}
      {isBlocked && <BlockedScreen onLogout={handleLogout} />}

      {showApp && (
        <AppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => {
            setSidebarCollapsed((c) => {
              const next = !c;
              try { localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(next)); } catch (_) {}
              return next;
            });
          }}
          displayName={displayName}
          avatarDisplayUrl={avatarDisplayUrl}
          user={user}
          profile={profile}
          onOpenProfile={openProfileModal}
          onLogout={handleLogout}
          newTaskNotification={newTaskNotification}
          onDismissNotification={() => setNewTaskNotification(null)}
          sessionEndReminder={sessionEndReminder}
          onDismissSessionReminder={() => setSessionEndReminder(false)}
          onEndSessionClick={() => { setSessionEndReminder(false); setShowEndSessionModal(true); }}
          taskReminderDismissed={taskReminderDismissed}
          onDismissTaskReminder={() => setTaskReminderDismissed(true)}
          incompleteTaskCount={tasks.filter((t) => !t.completed).length}
          supabase={supabase}
          toastMessage={toastMessage}
        >
      {showAiModal && <AiModal aiResponse={aiResponse} onClose={() => setShowAiModal(false)} />}

      {showProfileModal && (
        <ProfileModal
          profileEditName={profileEditName}
          setProfileEditName={setProfileEditName}
          profileEditPhone={profileEditPhone}
          setProfileEditPhone={setProfileEditPhone}
          profileAvatarPreview={profileAvatarPreview}
          setProfileAvatarFile={setProfileAvatarFile}
          setProfileAvatarPreview={setProfileAvatarPreview}
          savingProfile={savingProfile}
          onSave={handleProfileSaveRequest}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showReauthModal && user?.email && (
        <ReauthModal
          userEmail={user.email}
          title="تأكيد هويتك"
          message="أدخل كلمة المرور الحالية لتأكيد تعديل الملف الشخصي"
          onConfirm={handleReauthConfirm}
          onClose={() => { setShowReauthModal(false); setPendingActionAfterReauth(null); }}
        />
      )}

      {showAddTaskModal && adminSelectedForTask && (
        <AddTaskModal
          employee={adminSelectedForTask}
          adminTaskText={adminTaskText}
          setAdminTaskText={setAdminTaskText}
          onSubmit={submitAddTaskForEmployee}
          onClose={() => { setShowAddTaskModal(false); setAdminSelectedForTask(null); }}
          onSuggestTasks={suggestTasksForEmployee}
        />
      )}

      {showAddEmployeeModal && (
        <AddEmployeeModal
          addEmpSuccess={addEmpSuccess}
          newEmpEmail={newEmpEmail}
          setNewEmpEmail={setNewEmpEmail}
          newEmpName={newEmpName}
          setNewEmpName={setNewEmpName}
          newEmpPassword={newEmpPassword}
          setNewEmpPassword={setNewEmpPassword}
          addEmpError={addEmpError}
          onSubmit={handleAddEmployee}
          onClose={() => { setShowAddEmployeeModal(false); setAddEmpError(''); setAddEmpSuccess(false); }}
        />
      )}

      {showActivityModal && adminSelectedForActivity && (
        <ActivityModal
          employee={adminSelectedForActivity}
          employeeDailyHours={employeeDailyHours}
          formatSecondsToHM={formatSecondsToHM}
          adminActivityData={adminActivityData}
          onClose={() => { setShowActivityModal(false); setAdminSelectedForActivity(null); }}
        />
      )}

      {showEndSessionModal && (
        <EndSessionModal
          onConfirm={handleConfirmEndSession}
          onCancel={() => setShowEndSessionModal(false)}
        />
      )}

      {showSalaryModal && salaryEditEmployee && (
        <SalaryEditModal
          employee={salaryEditEmployee}
          salaryEditValue={salaryEditValue}
          setSalaryEditValue={setSalaryEditValue}
          onSave={handleSaveSalary}
          onClose={() => { setShowSalaryModal(false); setSalaryEditEmployee(null); }}
        />
      )}

      <MainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        user={user}
        displayName={displayName}
        displayRole={displayRole}
        avatarDisplayUrl={avatarDisplayUrl}
        elapsedTime={elapsedTime}
        formatTime={formatTime}
        isWorking={isWorking}
        handleToggleWork={handleToggleWork}
        dailyDisplay={dailyDisplay}
        screenshots={screenshots}
        tasks={tasks}
        adminDailySummary={adminDailySummary}
        setTasks={setTasks}
        newTask={newTask}
        setNewTask={setNewTask}
        monitoringEnabled={monitoringEnabled}
        supabase={supabase}
        syncTaskToSupabase={syncTaskToSupabase}
        onAddTask={async (e) => {
          e.preventDefault();
          if (!newTask.trim()) return;
          if (user?.id && supabase) {
            const { data } = await supabase.from('tasks').insert({ user_id: user.id, text: newTask.trim(), completed: false }).select().single();
            if (data) setTasks([data, ...tasks]);
          } else {
            setTasks([{ id: Date.now(), text: newTask.trim(), completed: false }, ...tasks]);
          }
          setNewTask('');
        }}
        adminGalleryLoading={adminGalleryLoading}
        adminGalleryScreenshots={adminGalleryScreenshots}
        userSavedScreenshots={userSavedScreenshots}
        userScreenshotsLoading={userScreenshotsLoading}
        setScreenshots={setScreenshots}
        takeScreenshot={takeScreenshot}
        history={history}
        adminHistory={adminHistory}
        activeUserIds={activeUserIds}
        adminHistoryLoading={adminHistoryLoading}
        adminHistoryError={adminHistoryError}
        userHistoryLoading={userHistoryLoading}
        loadAdminHistory={loadAdminHistory}
        loadUserHistory={handleRefreshUserHistory}
        adminLoading={adminLoading}
        adminScreenshotInterval={adminScreenshotInterval}
        setAdminScreenshotInterval={setAdminScreenshotInterval}
        handleSaveScreenshotInterval={handleSaveScreenshotInterval}
        activeEmployees={activeEmployees}
        disabledEmployees={disabledEmployees}
        employeeDailyHours={employeeDailyHours}
        employeeSalaryData={employeeSalaryData}
        formatSecondsToHM={formatSecondsToHM}
        openAddTaskForEmployee={openAddTaskForEmployee}
        openActivityForEmployee={openActivityForEmployee}
        openSalaryEdit={openSalaryEdit}
        handleRequestScreenshotForEmployee={handleRequestScreenshotForEmployee}
        handleDeleteEmployee={handleDeleteEmployee}
        handleRestoreEmployee={handleRestoreEmployee}
        requestingScreenshotFor={requestingScreenshotFor}
        setShowAddEmployeeModal={setShowAddEmployeeModal}
        setAddEmpError={setAddEmpError}
        setAddEmpSuccess={setAddEmpSuccess}
        refetchAdminEmployees={refetchAdminEmployees}
        aiLoading={aiLoading}
        callGemini={callGemini}
        callGeminiWeeklySummary={callGeminiWeeklySummary}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        storageKeys={STORAGE_KEYS}
        setToastMessage={setToastMessage}
      />
        </AppLayout>
      )}
    </div>
  );
};

export default App;

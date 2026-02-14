import { useMemo, useState } from 'react';
import { Eye, Monitor, Loader2, Trash2, User, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';

export default function MonitorTab({
  isAdmin,
  isWorking,
  monitoringEnabled,
  adminGalleryLoading,
  adminGalleryScreenshots,
  userSavedScreenshots = [],
  userScreenshotsLoading = false,
  screenshots,
  setScreenshots,
}) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const screenshotsByEmployee = useMemo(() => {
    if (!adminGalleryScreenshots?.length) return [];
    const byId = {};
    adminGalleryScreenshots.forEach((img) => {
      const key = img.user_id || 'unknown';
      if (!byId[key]) byId[key] = { name: img.full_name || 'موظف', list: [] };
      byId[key].list.push(img);
    });
    return Object.entries(byId).map(([userId, { name, list }]) => ({ userId, name, list }));
  }, [adminGalleryScreenshots]);

  return (
    <div className="card card-soft bg-base-100 p-6 md:p-10 hover-lift">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-base-content">
          <Eye className="text-primary w-7 h-7 md:w-8 md:h-8" />
          معرض التتبع الرقمي
        </h2>
        <p className="text-base-content/50 text-sm font-medium mt-1">
          {isAdmin ? 'لقطات شاشة مصنفة حسب الموظف — انقر على أي لقطة لعرضها بالكامل' : 'سجل بصري للجلسة الحالية ولقطاتك المحفوظة من جلسات سابقة'}
        </p>
      </div>

      {isAdmin ? (
        adminGalleryLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : adminGalleryScreenshots.length === 0 ? (
          <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-base-200 bg-base-200/40 text-base-content/60">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">لا توجد لقطات مسجلة من الموظفين</p>
            <p className="text-sm mt-2 font-medium">ستظهر اللقطات هنا عندما يلتقط الموظفون صوراً من أجهزتهم</p>
          </div>
        ) : (
          <div className="space-y-8">
            {screenshotsByEmployee.map(({ userId, name, list }) => (
              <Card key={userId} className="border border-base-200 shadow-sm overflow-hidden rounded-2xl bg-base-100">
                <CardHeader className="pb-2 border-b border-base-200 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-base-content">{name}</h3>
                    <p className="text-sm text-base-content/50">لقطات هذا الموظف</p>
                  </div>
                  <span className="badge badge-primary badge-lg">{list.length}</span>
                </CardHeader>
                <CardBody className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {list.map((img) => (
                      <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-default-200/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        {img.url ? (
                          <button type="button" className="block w-full h-52 overflow-hidden cursor-pointer text-right focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl" onClick={() => setFullscreenImage({ url: img.url, time: img.time_display, name: name })}>
                            <img src={img.url} alt="لقطة" className="w-full h-52 object-cover" />
                          </button>
                        ) : (
                          <div className="w-full h-52 bg-default-100 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-default-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-20 flex gap-2">
                          {img.is_virtual && (
                            <span className="bg-primary text-white text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">Simulated</span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                          <div className="flex flex-col text-white">
                            <span className="font-bold text-sm">{img.time_display || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-10">
          {/* لقطات الجلسة الحالية */}
          {screenshots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> الجلسة الحالية ({screenshots.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {screenshots.map((img) => (
                  <div key={img.id} role="button" tabIndex={0} className="group relative rounded-2xl overflow-hidden border border-default-200/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => setFullscreenImage({ url: img.data, time: img.time, name: null })} onKeyDown={(e) => e.key === 'Enter' && setFullscreenImage({ url: img.data, time: img.time, name: null })}>
                    <img src={img.data} alt="لقطة شاشة" className="w-full h-52 object-cover" />
                    <div className="absolute top-3 right-3 z-20">
                      {img.isVirtual && (
                        <span className="bg-primary text-white text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">Simulated</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                      <div className="flex justify-between items-center text-white pointer-events-none">
                        <span className="font-bold text-sm">{img.time}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button isIconOnly size="sm" color="danger" variant="flat" className="min-w-unit-8 rounded-xl" onPress={(e) => { e.stopPropagation(); e.preventDefault(); setScreenshots((prev) => prev.filter((s) => s.id !== img.id)); }} aria-label="حذف">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* لقطاتك المحفوظة من جلسات سابقة */}
          <div>
            <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" /> لقطاتك المحفوظة
            </h3>
            {userScreenshotsLoading ? (
              <div className="flex flex-col items-center gap-4 py-16 rounded-2xl bg-base-200/40">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-base-content/60 text-sm font-medium">جاري تحميل اللقطات...</p>
              </div>
            ) : userSavedScreenshots.length === 0 && screenshots.length === 0 ? (
              <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-default-200 bg-default-50 text-default-500">
                <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">لا توجد لقطات محفوظة</p>
                <p className="text-sm mt-2 font-medium">ستُسجّل اللقطات تلقائياً أثناء الجلسة عند تفعيل المراقبة، أو عند طلب الأدمن لقطة</p>
              </div>
            ) : userSavedScreenshots.length === 0 ? (
              <p className="text-base-content/50 text-sm py-4">لا توجد لقطات محفوظة من جلسات سابقة بعد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {userSavedScreenshots.map((img) => (
                  <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-default-200/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {img.url ? (
                      <button type="button" className="block w-full h-52 overflow-hidden cursor-pointer text-right focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl" onClick={() => setFullscreenImage({ url: img.url, time: img.time_display, name: null })}>
                        <img src={img.url} alt="لقطة" className="w-full h-52 object-cover" />
                      </button>
                    ) : (
                      <div className="w-full h-52 bg-default-100 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-default-400" />
                      </div>
                    )}
                    {img.is_virtual && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-primary text-white text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">Simulated</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                      <span className="font-bold text-sm text-white">{img.time_display || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={!!fullscreenImage} onClose={() => setFullscreenImage(null)} size="5xl" classNames={{ base: 'max-h-[90vh]', body: 'p-0 overflow-hidden' }} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-row items-center justify-between gap-2 border-b border-default-200 pb-4">
            <div>
              {fullscreenImage?.name && <p className="text-default-500 text-sm font-medium">{fullscreenImage.name}</p>}
              <p className="text-foreground font-bold">{fullscreenImage?.time || '—'}</p>
            </div>
            <Button isIconOnly variant="light" size="sm" onPress={() => setFullscreenImage(null)} aria-label="إغلاق">
              <X className="w-5 h-5" />
            </Button>
          </ModalHeader>
          <ModalBody className="p-0">
            {fullscreenImage?.url && (
              <div className="w-full min-h-[50vh] flex items-center justify-center bg-default-100">
                <img src={fullscreenImage.url} alt="لقطة بالحجم الكامل" className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-b-2xl" />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

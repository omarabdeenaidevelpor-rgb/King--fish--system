import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app: {
        title: 'King Fish Factory Operations',
        dashboard: 'Dashboard',
        receiving: 'Receiving',
        processing: 'Processing',
        quality: 'Quality',
        inventory: 'Inventory',
        shipments: 'Shipments',
        settings: 'Settings',
        logout: 'Logout'
      },
      lang: {
        en: 'English',
        ar: 'Arabic',
        it: 'Italiano'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        status: 'Status',
        actions: 'Actions',
        date: 'Date',
        loading: 'Loading...',
        noData: 'No data available'
      },
      receiving: {
        title: 'Raw Material Receiving',
        supplier: 'Supplier',
        vessel: 'Vessel / Boat',
        weight: 'Weight (kg)',
        temp: 'Temperature (°C)',
        lotId: 'Lot ID',
        accept: 'Accept',
        reject: 'Reject',
        inspection: 'Inspection Details'
      },
      processing: {
        title: 'Processing & Manufacturing',
        inputLot: 'Input Lot',
        processType: 'Process Type',
        outputProduct: 'Output Product',
        waste: 'Waste (kg)',
        yield: 'Yield (%)',
        start: 'Start Process',
        finish: 'Finish Process'
      },
      quality: {
        title: 'Quality & HACCP',
        ccp: 'CCP Point',
        limit: 'Limit',
        result: 'Result',
        release: 'Release Lot',
        hold: 'Put on Hold',
        nonConformance: 'Non-Conformance'
      },
      inventory: {
        title: 'Inventory & Cold Storage',
        location: 'Location',
        rack: 'Rack',
        stock: 'Stock Level',
        move: 'Move Stock'
      },
      shipments: {
        title: 'Shipments & Export',
        customer: 'Customer',
        destination: 'Destination',
        container: 'Container #',
        seal: 'Seal #',
        ship: 'Dispatch Shipment'
      }
    }
  },
  ar: {
    translation: {
      app: {
        title: 'King Fish نظام تشغيل المصنع',
        dashboard: 'لوحة التحكم',
        receiving: 'الاستلام',
        processing: 'التصنيع',
        quality: 'الجودة',
        inventory: 'المخزون',
        shipments: 'الشحنات',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج'
      },
      lang: {
        en: 'English',
        ar: 'العربية',
        it: 'Italiano'
      },
      common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        edit: 'تعديل',
        delete: 'حذف',
        status: 'الحالة',
        actions: 'الإجراءات',
        date: 'التاريخ',
        loading: 'جاري التحميل...',
        noData: 'لا توجد بيانات'
      },
      receiving: {
        title: 'استلام المواد الخام',
        supplier: 'المورد',
        vessel: 'المركب / المزرعة',
        weight: 'الوزن (كجم)',
        temp: 'درجة الحرارة (م°)',
        lotId: 'رقم الدفعة',
        accept: 'قبول',
        reject: 'رفض',
        inspection: 'تفاصيل الفحص'
      },
      processing: {
        title: 'التصنيع والتحويل',
        inputLot: 'الدفعة الداخلة',
        processType: 'نوع العملية',
        outputProduct: 'المنتج الناتج',
        waste: 'الفاقد (كجم)',
        yield: 'نسبة الاستخلاص (%)',
        start: 'بدء العملية',
        finish: 'إنهاء العملية'
      },
      quality: {
        title: 'الجودة و HACCP',
        ccp: 'نقطة تحكم حرجة',
        limit: 'الحد المسموح',
        result: 'النتيجة',
        release: 'إفراج عن الدفعة',
        hold: 'حجز مؤقت',
        nonConformance: 'عدم مطابقة'
      },
      inventory: {
        title: 'المخزون والتخزين البارد',
        location: 'الموقع',
        rack: 'الرف',
        stock: 'مستوى المخزون',
        move: 'نقل مخزون'
      },
      shipments: {
        title: 'الشحنات والتصدير',
        customer: 'العميل',
        destination: 'الوجهة',
        container: 'رقم الحاوية',
        seal: 'رقم الختم',
        ship: 'إرسال الشحنة'
      }
    }
  },
  it: {
    translation: {
      app: {
        title: 'King Fish Operazioni Fabbrica',
        dashboard: 'Dashboard',
        receiving: 'Ricezione',
        processing: 'Lavorazione',
        quality: 'Qualità',
        inventory: 'Inventario',
        shipments: 'Spedizioni',
        settings: 'Impostazioni',
        logout: 'Disconnetti'
      },
      lang: {
        en: 'English',
        ar: 'Arabo',
        it: 'Italiano'
      },
      common: {
        save: 'Salva',
        cancel: 'Annulla',
        edit: 'Modifica',
        delete: 'Elimina',
        status: 'Stato',
        actions: 'Azioni',
        date: 'Data',
        loading: 'Caricamento...',
        noData: 'Nessun dato disponibile'
      },
      receiving: {
        title: 'Ricezione Materie Prime',
        supplier: 'Fornitore',
        vessel: 'Nave / Imbarcazione',
        weight: 'Peso (kg)',
        temp: 'Temperatura (°C)',
        lotId: 'ID Lotto',
        accept: 'Accetta',
        reject: 'Rifiuta',
        inspection: 'Dettagli Ispezione'
      },
      processing: {
        title: 'Lavorazione & Produzione',
        inputLot: 'Lotto in Ingresso',
        processType: 'Tipo di Processo',
        outputProduct: 'Prodotto in Uscita',
        waste: 'Scarto (kg)',
        yield: 'Resa (%)',
        start: 'Inizia Processo',
        finish: 'Termina Processo'
      },
      quality: {
        title: 'Qualità & HACCP',
        ccp: 'Punto CCP',
        limit: 'Limite',
        result: 'Risultato',
        release: 'Rilascia Lotto',
        hold: 'Metti in Attesa',
        nonConformance: 'Non Conformità'
      },
      inventory: {
        title: 'Inventario & Catena del Freddo',
        location: 'Posizione',
        rack: 'Scaffale',
        stock: 'Livello Scorte',
        move: 'Sposta Scorte'
      },
      shipments: {
        title: 'Spedizioni & Esportazione',
        customer: 'Cliente',
        destination: 'Destinazione',
        container: 'N. Container',
        seal: 'N. Sigillo',
        ship: 'Invia Spedizione'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['ar', 'en', 'it', 'fr', 'es', 'de'],
    fallbackLng: 'en',
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;

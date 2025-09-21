import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources for major Indian languages
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.jobs': 'Jobs',
      'nav.profile': 'Profile',
      'nav.contracts': 'Contracts',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      
      // Common
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.apply': 'Apply',
      'common.cancel': 'Cancel',
      'common.submit': 'Submit',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.back': 'Back',
      'common.next': 'Next',
      
      // Home page
      'home.title': 'Find Fair Work Opportunities',
      'home.subtitle': 'Connect with verified employers and secure your rights',
      'home.searchPlaceholder': 'Search for jobs, skills, or location...',
      'home.activeContracts': 'Your Active Contracts',
      'home.trackProgress': 'Track progress and log your daily work',
      'home.browseJobs': 'Browse Jobs',
      'home.aiAssistant': 'AI Assistant',
      'home.aiDescription': 'Get help with jobs and contracts',
      
      // Jobs
      'jobs.title': 'Job Listings',
      'jobs.opportunitiesMatching': 'opportunities matching your skills',
      'jobs.welcomeBack': 'Welcome back,',
      'jobs.searchPlaceholder': 'Search jobs by title, description, or skills...',
      'jobs.allSkills': 'All Skills',
      'jobs.allPriorities': 'All Priorities',
      'jobs.highPriority': 'High Priority',
      'jobs.mediumPriority': 'Medium Priority',
      'jobs.lowPriority': 'Low Priority',
      'jobs.noJobs': 'No jobs found',
      'jobs.adjustFilters': 'Try adjusting your search criteria or filters to find more opportunities.',
      'jobs.viewDetails': 'View Details',
      'jobs.applyNow': 'Apply Now',
      'jobs.salary': 'Salary',
      'jobs.location': 'Location',
      'jobs.duration': 'Duration',
      'jobs.skills': 'Required Skills',
      'jobs.posted': 'Posted',
      'jobs.daysAgo': 'days ago',
      'jobs.deadline': 'Deadline',
      
      // Job Analysis
      'analysis.title': 'Job Analysis',
      'analysis.recommendation': 'Recommendation',
      'analysis.skillsMatch': 'Skills Match',
      'analysis.wageAnalysis': 'Wage Analysis',
      'analysis.location': 'Location Analysis',
      'analysis.askAI': 'Ask AI',
      'analysis.suitableQuestion': 'Is this job suitable for me?',
      'analysis.wageQuestion': 'Analyze the wage fairness',
      'analysis.locationQuestion': 'Check location compatibility',
      'analysis.termsQuestion': 'Review contract terms',
      'analysis.risksQuestion': 'What are the risks?',
      'analysis.negotiateQuestion': 'Should I negotiate?',
      
      // Profile
      'profile.title': 'My Profile',
      'profile.personalInfo': 'Personal Information',
      'profile.skills': 'Skills & Expertise',
      'profile.experience': 'Experience',
      'profile.preferences': 'Work Preferences',
      'profile.location': 'Location',
      'profile.contact': 'Contact Information',
      
      // Authentication
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.phone': 'Phone Number',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.dontHaveAccount': "Don't have an account?",
      'auth.alreadyHaveAccount': 'Already have an account?',
      
      // Language Widget
      'language.title': 'Language / भाषा',
      'language.autoDetected': 'Auto-detected based on location',
      'language.selectLanguage': 'Select Language',
      'language.english': 'English',
      'language.hindi': 'हिंदी (Hindi)',
      'language.tamil': 'தமிழ் (Tamil)',
      'language.telugu': 'తెలుగు (Telugu)',
      'language.bengali': 'বাংলা (Bengali)',
      'language.marathi': 'मराठी (Marathi)',
      'language.gujarati': 'ગુજરાતી (Gujarati)',
      'language.kannada': 'ಕನ್ನಡ (Kannada)',
      'language.malayalam': 'മലയാളം (Malayalam)',
      'language.punjabi': 'ਪੰਜਾਬੀ (Punjabi)',
      'language.odia': 'ଓଡ଼ିଆ (Odia)',
    }
  },
  hi: {
    translation: {
      // Navigation
      'nav.home': 'होम',
      'nav.jobs': 'नौकरियां',
      'nav.profile': 'प्रोफाइल',
      'nav.contracts': 'अनुबंध',
      'nav.login': 'लॉगिन',
      'nav.register': 'पंजीकरण',
      'nav.logout': 'लॉगआउट',
      
      // Common
      'common.search': 'खोजें',
      'common.filter': 'फिल्टर',
      'common.apply': 'आवेदन करें',
      'common.cancel': 'रद्द करें',
      'common.submit': 'जमा करें',
      'common.save': 'सेव करें',
      'common.edit': 'संपादित करें',
      'common.delete': 'हटाएं',
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'त्रुटि',
      'common.success': 'सफलता',
      'common.back': 'वापस',
      'common.next': 'आगे',
      
      // Home page
      'home.title': 'निष्पक्ष कार्य अवसर खोजें',
      'home.subtitle': 'सत्यापित नियोक्ताओं से जुड़ें और अपने अधिकारों को सुरक्षित करें',
      'home.searchPlaceholder': 'नौकरी, कौशल या स्थान खोजें...',
      'home.activeContracts': 'आपके सक्रिय अनुबंध',
      'home.trackProgress': 'प्रगति को ट्रैक करें और अपना दैनिक काम दर्ज करें',
      'home.browseJobs': 'नौकरियां ब्राउज़ करें',
      'home.aiAssistant': 'AI सहायक',
      'home.aiDescription': 'नौकरियों और अनुबंधों के साथ सहायता प्राप्त करें',
      
      // Jobs
      'jobs.title': 'नौकरी सूचियां',
      'jobs.opportunitiesMatching': 'आपके कौशल से मेल खाते अवसर',
      'jobs.welcomeBack': 'वापसी पर स्वागत है,',
      'jobs.searchPlaceholder': 'शीर्षक, विवरण या कौशल द्वारा नौकरी खोजें...',
      'jobs.allSkills': 'सभी कौशल',
      'jobs.allPriorities': 'सभी प्राथमिकताएं',
      'jobs.highPriority': 'उच्च प्राथमिकता',
      'jobs.mediumPriority': 'मध्यम प्राथमिकता',
      'jobs.lowPriority': 'कम प्राथमिकता',
      'jobs.noJobs': 'कोई नौकरी नहीं मिली',
      'jobs.adjustFilters': 'अधिक अवसर खोजने के लिए अपने खोज मापदंड या फिल्टर को समायोजित करने का प्रयास करें।',
      'jobs.viewDetails': 'विवरण देखें',
      'jobs.applyNow': 'अभी आवेदन करें',
      'jobs.salary': 'वेतन',
      'jobs.location': 'स्थान',
      'jobs.duration': 'अवधि',
      'jobs.skills': 'आवश्यक कौशल',
      'jobs.posted': 'पोस्ट किया गया',
      'jobs.daysAgo': 'दिन पहले',
      'jobs.deadline': 'समय सीमा',
      
      // Job Analysis
      'analysis.title': 'नौकरी विश्लेषण',
      'analysis.recommendation': 'सिफारिश',
      'analysis.skillsMatch': 'कौशल मिलान',
      'analysis.wageAnalysis': 'वेतन विश्लेषण',
      'analysis.location': 'स्थान विश्लेषण',
      'analysis.askAI': 'AI से पूछें',
      'analysis.suitableQuestion': 'क्या यह नौकरी मेरे लिए उपयुक्त है?',
      'analysis.wageQuestion': 'वेतन की निष्पक्षता का विश्लेषण करें',
      'analysis.locationQuestion': 'स्थान की अनुकूलता जांचें',
      'analysis.termsQuestion': 'अनुबंध की शर्तों की समीक्षा करें',
      'analysis.risksQuestion': 'जोखिम क्या हैं?',
      'analysis.negotiateQuestion': 'क्या मुझे बातचीत करनी चाहिए?',
      
      // Profile
      'profile.title': 'मेरी प्रोफाइल',
      'profile.personalInfo': 'व्यक्तिगत जानकारी',
      'profile.skills': 'कौशल और विशेषज्ञता',
      'profile.experience': 'अनुभव',
      'profile.preferences': 'कार्य प्राथमिकताएं',
      'profile.location': 'स्थान',
      'profile.contact': 'संपर्क जानकारी',
      
      // Authentication
      'auth.login': 'लॉगिन',
      'auth.register': 'पंजीकरण',
      'auth.email': 'ईमेल',
      'auth.phone': 'फोन नंबर',
      'auth.password': 'पासवर्ड',
      'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
      'auth.forgotPassword': 'पासवर्ड भूल गए?',
      'auth.dontHaveAccount': "खाता नहीं है?",
      'auth.alreadyHaveAccount': 'पहले से खाता है?',
      
      // Language Widget
      'language.title': 'भाषा / Language',
      'language.autoDetected': 'स्थान के आधार पर स्वचालित रूप से पता लगाया गया',
      'language.selectLanguage': 'भाषा चुनें',
      'language.english': 'English (अंग्रेजी)',
      'language.hindi': 'हिंदी',
      'language.tamil': 'तमिल',
      'language.telugu': 'तेलुगु',
      'language.bengali': 'बंगाली',
      'language.marathi': 'मराठी',
      'language.gujarati': 'गुजराती',
      'language.kannada': 'कन्नड़',
      'language.malayalam': 'मलयालम',
      'language.punjabi': 'पंजाबी',
      'language.odia': 'ओड़िया',
    }
  },
  ta: {
    translation: {
      // Navigation
      'nav.home': 'முகப்பு',
      'nav.jobs': 'வேலைகள்',
      'nav.profile': 'சுயவிவரம்',
      'nav.contracts': 'ஒப்பந்தங்கள்',
      'nav.login': 'உள்நுழைய',
      'nav.register': 'பதிவு',
      'nav.logout': 'வெளியேறு',
      
      // Common
      'common.search': 'தேடு',
      'common.filter': 'வடிகட்டு',
      'common.apply': 'விண்ணப்பிக்க',
      'common.cancel': 'ரத்து செய்',
      'common.submit': 'சமர்ப்பிக்க',
      'common.save': 'சேமி',
      'common.edit': 'திருத்து',
      'common.delete': 'நீக்கு',
      'common.loading': 'ஏற்றுகிறது...',
      'common.error': 'பிழை',
      'common.success': 'வெற்றி',
      'common.back': 'பின்',
      'common.next': 'அடுத்து',
      
      // Home page
      'home.title': 'நியாயமான வேலை வாய்ப்புகளைக் கண்டறியுங்கள்',
      'home.subtitle': 'சரிபார்க்கப்பட்ட முதலாளிகளுடன் இணைந்து உங்கள் உரிமைகளைப் பாதுகாக்கவும்',
      'home.searchPlaceholder': 'வேலை, திறன் அல்லது இடத்தைத் தேடுங்கள்...',
      'home.aiAssistant': 'AI உதவியாளர்',
      'home.aiDescription': 'தனிப்பயனாக்கப்பட்ட வேலை பரிந்துரைகள் மற்றும் சட்ட வழிகாட்டுதல் பெறுங்கள்',
      
      // Language Widget
      'language.title': 'மொழி / Language',
      'language.autoDetected': 'இருப்பிடத்தின் அடிப்படையில் தானாக கண்டறியப்பட்டது',
      'language.selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',
      'language.english': 'English (ஆங்கிலம்)',
      'language.hindi': 'हिंदी (இந்தி)',
      'language.tamil': 'தமிழ்',
      'language.telugu': 'తెలుగు (தெலுங்கு)',
      'language.bengali': 'বাংলা (பெங்காலி)',
      'language.marathi': 'मराठी (மராத்தி)',
      'language.gujarati': 'ગુજરાતી (குஜராத்தி)',
      'language.kannada': 'ಕನ್ನಡ (கன்னடம்)',
      'language.malayalam': 'മലയാളം (மலையாளம்)',
      'language.punjabi': 'ਪੰਜਾਬੀ (பஞ்சாபி)',
      'language.odia': 'ଓଡ଼ିଆ (ஒடியா)',
    }
  },
  te: {
    translation: {
      // Navigation
      'nav.home': 'హోమ్',
      'nav.jobs': 'ఉద్యోగాలు',
      'nav.profile': 'ప్రొఫైల్',
      'nav.contracts': 'ఒప్పందాలు',
      'nav.login': 'లాగిన్',
      'nav.register': 'నమోదు',
      'nav.logout': 'లాగౌట్',
      
      // Common
      'common.search': 'వెతకండి',
      'common.filter': 'ఫిల్టర్',
      'common.apply': 'దరఖాస్తు చేయండి',
      'common.cancel': 'రద్దు చేయండి',
      'common.submit': 'సమర్పించండి',
      'common.save': 'సేవ్ చేయండి',
      'common.edit': 'సవరించండి',
      'common.delete': 'తొలగించండి',
      'common.loading': 'లోడ్ అవుతుంది...',
      'common.error': 'లోపం',
      'common.success': 'విజయం',
      'common.back': 'వెనుకకు',
      'common.next': 'తదుపరి',
      
      // Home page
      'home.title': 'న్యాయమైన పని అవకాశాలను కనుగొనండి',
      'home.subtitle': 'ధృవీకరించబడిన యజమానులతో కనెక్ట్ అవ్వండి మరియు మీ హక్కులను భద్రపరచుకోండి',
      'home.searchPlaceholder': 'ఉద్యోగం, నైపుణ్యాలు లేదా స్థానం కోసం వెతకండి...',
      'home.aiAssistant': 'AI అసిస్టెంట్',
      'home.aiDescription': 'వ్యక్తిగతీకరించిన ఉద్యోగ సిఫార్సులు మరియు చట్టపరమైన మార్గదర్శకత్వం పొందండి',
      
      // Language Widget
      'language.title': 'భాష / Language',
      'language.autoDetected': 'స్థానం ఆధారంగా స్వయంచాలకంగా గుర్తించబడింది',
      'language.selectLanguage': 'భాషను ఎంచుకోండి',
      'language.english': 'English (ఆంగ్లం)',
      'language.hindi': 'हिंदी (హిందీ)',
      'language.tamil': 'தமிழ் (తమిళం)',
      'language.telugu': 'తెలుగు',
      'language.bengali': 'বাংলা (బెంగాలీ)',
      'language.marathi': 'मराठी (మరాఠీ)',
      'language.gujarati': 'ગુજરાતી (గుజరాతీ)',
      'language.kannada': 'ಕನ್ನಡ (కన్నడ)',
      'language.malayalam': 'മലയാളം (మలయాళం)',
      'language.punjabi': 'ਪੰਜਾਬੀ (పంజాబీ)',
      'language.odia': 'ଓଡ଼ିଆ (ఒడియా)',
    }
  },
  bn: {
    translation: {
      // Navigation
      'nav.home': 'হোম',
      'nav.jobs': 'চাকরি',
      'nav.profile': 'প্রোফাইল',
      'nav.contracts': 'চুক্তি',
      'nav.login': 'লগইন',
      'nav.register': 'নিবন্ধন',
      'nav.logout': 'লগআউট',
      
      // Common
      'common.search': 'খুঁজুন',
      'common.filter': 'ফিল্টার',
      'common.apply': 'আবেদন করুন',
      'common.cancel': 'বাতিল করুন',
      'common.submit': 'জমা দিন',
      'common.save': 'সেভ করুন',
      'common.edit': 'সম্পাদনা',
      'common.delete': 'মুছুন',
      'common.loading': 'লোড হচ্ছে...',
      'common.error': 'ত্রুটি',
      'common.success': 'সফল',
      'common.back': 'পিছনে',
      'common.next': 'পরবর্তী',
      
      // Home page
      'home.title': 'ন্যায্য কাজের সুযোগ খুঁজুন',
      'home.subtitle': 'যাচাইকৃত নিয়োগকর্তাদের সাথে সংযুক্ত হন এবং আপনার অধিকার সুরক্ষিত করুন',
      'home.searchPlaceholder': 'চাকরি, দক্ষতা বা অবস্থান খুঁজুন...',
      'home.aiAssistant': 'AI সহায়ক',
      'home.aiDescription': 'ব্যক্তিগতকৃত চাকরির সুপারিশ এবং আইনি নির্দেশনা পান',
      
      // Language Widget
      'language.title': 'ভাষা / Language',
      'language.autoDetected': 'অবস্থানের ভিত্তিতে স্বয়ংক্রিয়ভাবে সনাক্ত করা হয়েছে',
      'language.selectLanguage': 'ভাষা নির্বাচন করুন',
      'language.english': 'English (ইংরেজি)',
      'language.hindi': 'हिंदी (হিন্দি)',
      'language.tamil': 'தமிழ் (তামিল)',
      'language.telugu': 'తెలుగు (তেলুগু)',
      'language.bengali': 'বাংলা',
      'language.marathi': 'मराठी (মারাঠি)',
      'language.gujarati': 'ગુજરાતી (গুজরাটি)',
      'language.kannada': 'ಕನ್ನಡ (কন্নড়)',
      'language.malayalam': 'മലയാളം (মালয়ালাম)',
      'language.punjabi': 'ਪੰਜਾਬੀ (পাঞ্জাবি)',
      'language.odia': 'ଓଡ଼ିଆ (ওড়িয়া)',
    }
  },
  ml: {
    translation: {
      // Navigation
      'nav.home': 'ഹോം',
      'nav.jobs': 'ജോലികൾ',
      'nav.profile': 'പ്രൊഫൈൽ',
      'nav.contracts': 'കരാറുകൾ',
      'nav.login': 'ലോഗിൻ',
      'nav.register': 'രജിസ്റ്റർ',
      'nav.logout': 'ലോഗൗട്ട്',
      
      // Common
      'common.search': 'തിരയുക',
      'common.filter': 'ഫിൽട്ടർ',
      'common.apply': 'അപേക്ഷിക്കുക',
      'common.cancel': 'റദ്ദാക്കുക',
      'common.submit': 'സമർപ്പിക്കുക',
      'common.save': 'സേവ് ചെയ്യുക',
      'common.edit': 'എഡിറ്റ് ചെയ്യുക',
      'common.delete': 'ഇല്ലാതാക്കുക',
      'common.loading': 'ലോഡ് ചെയ്യുന്നു...',
      'common.error': 'പിശക്',
      'common.success': 'വിജയം',
      'common.back': 'തിരികെ',
      'common.next': 'അടുത്തത്',
      
      // Home page
      'home.title': 'ന്യായമായ ജോലി അവസരങ്ങൾ കണ്ടെത്തുക',
      'home.subtitle': 'പരിശോധിച്ച തൊഴിലുടമകളുമായി ബന്ധപ്പെടുകയും നിങ്ങളുടെ അവകാശങ്ങൾ സുരക്ഷിതമാക്കുകയും ചെയ്യുക',
      'home.searchPlaceholder': 'ജോലി, വൈദഗ്ധ്യം അല്ലെങ്കിൽ സ്ഥലം തിരയുക...',
      'home.activeContracts': 'നിങ്ങളുടെ സജീവ കരാറുകൾ',
      'home.trackProgress': 'പ്രഗതി ട്രാക്ക് ചെയ്യുകയും നിങ്ങളുടെ ദൈനംദിന ജോലി ലോഗ് ചെയ്യുകയും ചെയ്യുക',
      'home.browseJobs': 'ജോലികൾ ബ്രൗസ് ചെയ്യുക',
      'home.aiAssistant': 'AI സഹായി',
      'home.aiDescription': 'ജോലികളും കരാറുകളും സംബന്ധിച്ച് സഹായം നേടുക',
      
      // Jobs
      'jobs.title': 'ജോലി ലിസ്റ്റിംഗുകൾ',
      'jobs.opportunitiesMatching': 'നിങ്ങളുടെ വൈദഗ്ധ്യവുമായി പൊരുത്തപ്പെടുന്ന അവസരങ്ങൾ',
      'jobs.welcomeBack': 'വീണ്ടും സ്വാഗതം,',
      'jobs.searchPlaceholder': 'ശീർഷകം, വിവരണം അല്ലെങ്കിൽ വൈദഗ്ധ്യം ഉപയോഗിച്ച് ജോലികൾ തിരയുക...',
      'jobs.allSkills': 'എല്ലാ വൈദഗ്ധ്യങ്ങളും',
      'jobs.allPriorities': 'എല്ലാ മുൻഗണനകളും',
      'jobs.highPriority': 'ഉയർന്ന മുൻഗണന',
      'jobs.mediumPriority': 'ഇടത്തരം മുൻഗണന',
      'jobs.lowPriority': 'കുറഞ്ഞ മുൻഗണന',
      'jobs.noJobs': 'ജോലികൾ കണ്ടെത്തിയില്ല',
      'jobs.adjustFilters': 'കൂടുതൽ അവസരങ്ങൾ കണ്ടെത്താൻ നിങ്ങളുടെ തിരയൽ മാനദണ്ഡങ്ങളോ ഫിൽട്ടറുകളോ ക്രമീകരിക്കാൻ ശ്രമിക്കുക.',
      'jobs.viewDetails': 'വിശദാംശങ്ങൾ കാണുക',
      'jobs.applyNow': 'ഇപ്പോൾ അപേക്ഷിക്കുക',
      'jobs.salary': 'ശമ്പളം',
      'jobs.location': 'സ്ഥലം',
      'jobs.duration': 'കാലയളവ്',
      'jobs.skills': 'ആവശ്യമായ വൈദഗ്ധ്യങ്ങൾ',
      'jobs.posted': 'പോസ്റ്റ് ചെയ്തത്',
      'jobs.daysAgo': 'ദിവസങ്ങൾക്ക് മുമ്പ്',
      'jobs.deadline': 'അവസാന തീയതി',
      
      // Job Analysis
      'analysis.title': 'ജോലി വിശകലനം',
      'analysis.recommendation': 'ശുപാർശ',
      'analysis.skillsMatch': 'വൈദഗ്ധ്യ പൊരുത്തം',
      'analysis.wageAnalysis': 'വേതന വിശകലനം',
      'analysis.location': 'സ്ഥല വിശകലനം',
      'analysis.askAI': 'AI യോട് ചോദിക്കുക',
      'analysis.suitableQuestion': 'ഈ ജോലി എനിക്ക് അനുയോജ്യമാണോ?',
      'analysis.wageQuestion': 'വേതന ന്യായത വിശകലനം ചെയ്യുക',
      'analysis.locationQuestion': 'സ്ഥല അനുയോജ്യത പരിശോധിക്കുക',
      'analysis.termsQuestion': 'കരാർ നിബന്ധനകൾ അവലോകനം ചെയ്യുക',
      'analysis.risksQuestion': 'അപകടസാധ്യതകൾ എന്താണ്?',
      'analysis.negotiateQuestion': 'ഞാൻ ചർച്ച ചെയ്യണോ?',
      
      // Profile
      'profile.title': 'എന്റെ പ്രൊഫൈൽ',
      'profile.personalInfo': 'വ്യക്തിഗത വിവരങ്ങൾ',
      'profile.skills': 'വൈദഗ്ധ്യവും വൈദഗ്ധ്യവും',
      'profile.experience': 'അനുഭവം',
      'profile.preferences': 'ജോലി മുൻഗണനകൾ',
      'profile.location': 'സ്ഥലം',
      'profile.contact': 'ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ',
      
      // Authentication
      'auth.login': 'ലോഗിൻ',
      'auth.register': 'രജിസ്റ്റർ',
      'auth.email': 'ഇമെയിൽ',
      'auth.phone': 'ഫോൺ നമ്പർ',
      'auth.password': 'പാസ്‌വേഡ്',
      'auth.confirmPassword': 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക',
      'auth.forgotPassword': 'പാസ്‌വേഡ് മറന്നോ?',
      'auth.dontHaveAccount': "അക്കൗണ്ട് ഇല്ലേ?",
      'auth.alreadyHaveAccount': 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?',
      
      // Language Widget
      'language.title': 'ഭാഷ / Language',
      'language.autoDetected': 'സ്ഥലത്തെ അടിസ്ഥാനമാക്കി സ്വയമേവ കണ്ടെത്തി',
      'language.selectLanguage': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
      'language.english': 'English (ഇംഗ്ലീഷ്)',
      'language.hindi': 'हिंदी (ഹിന്ദി)',
      'language.tamil': 'தமிழ் (തമിഴ്)',
      'language.telugu': 'తెలుగు (തെലുങ്ക്)',
      'language.bengali': 'বাংলা (ബംഗാളി)',
      'language.marathi': 'मराठी (മറാത്തി)',
      'language.gujarati': 'ગુજરાતી (ഗുജറാത്തി)',
      'language.kannada': 'ಕನ್ನಡ (കന്നഡ)',
      'language.malayalam': 'മലയാളം',
      'language.punjabi': 'ਪੰਜਾਬੀ (പഞ്ചാബി)',
      'language.odia': 'ଓଡ଼ିଆ (ഒഡിയ)',
    }
  }
};

// State to language mapping based on major languages
const stateLanguageMapping: { [key: string]: string } = {
  // Hindi belt
  'uttar pradesh': 'hi',
  'bihar': 'hi',
  'jharkhand': 'hi',
  'madhya pradesh': 'hi',
  'rajasthan': 'hi',
  'haryana': 'hi',
  'himachal pradesh': 'hi',
  'uttarakhand': 'hi',
  'delhi': 'hi',
  
  // Tamil Nadu
  'tamil nadu': 'ta',
  
  // Telugu states
  'andhra pradesh': 'te',
  'telangana': 'te',
  
  // Bengali
  'west bengal': 'bn',
  'tripura': 'bn',
  
  // Maharashtra (Marathi)
  'maharashtra': 'hi', // Using Hindi as fallback since Marathi not fully implemented
  
  // Gujarat (Gujarati)
  'gujarat': 'hi', // Using Hindi as fallback
  
  // Karnataka (Kannada)
  'karnataka': 'hi', // Using Hindi as fallback
  
  // Kerala (Malayalam)
  'kerala': 'ml', // Using Malayalam as fallback
  
  // Punjab (Punjabi)
  'punjab': 'hi', // Using Hindi as fallback
  
  // Odisha (Odia)
  'odisha': 'hi', // Using Hindi as fallback
  
  // Default to English for other states
};

// Location detection service
export const locationService = {
  async detectLocation(): Promise<{ state: string; language: string } | null> {
    try {
      // First try browser geolocation
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Use reverse geocoding to get location details
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await response.json();
                const state = data.principalSubdivision?.toLowerCase() || '';
                const language = stateLanguageMapping[state] || 'en';
                
                console.log('Location detected:', { state: data.principalSubdivision, language });
                resolve({ state: data.principalSubdivision || '', language });
              } catch (error) {
                console.error('Reverse geocoding failed:', error);
                resolve(null);
              }
            },
            (error) => {
              console.error('Geolocation failed:', error);
              resolve(null);
            },
            { timeout: 10000 }
          );
        });
      }
      
      // Fallback: Try to detect from browser language
      const browserLang = navigator.language.substring(0, 2);
      if (Object.keys(resources).includes(browserLang)) {
        return { state: '', language: browserLang };
      }
      
      return null;
    } catch (error) {
      console.error('Location detection failed:', error);
      return null;
    }
  }
};

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Default language
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
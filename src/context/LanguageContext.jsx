import React, { createContext, useContext, useState } from 'react';

const translations = {
  English: {
    // General / Brand
    brandName: 'e-mobility-vehicle-portal',
    portalTitle: 'e-mobility-vehicle-portal',
    portalSubtitle: 'Manage vehicles, fines and disputes in one place',
    secNote: 'Secured with 256-bit encryption',
    home: 'Home',
    garage: 'Garage',
    tickets: 'Tickets',
    profile: 'Profile',
    features: 'Features',

    // Landing View
    heroSubheading: 'E-MOBILITY-VEHICLE-PORTAL',
    heroFocalTitle: 'Experience the future of digital vehicle management with our next-generation liquid interface.',
    getStarted: 'Get Started',
    premiumFeatures: 'Premium Features',
    bankSecurityTitle: 'Bank-Grade Security',
    bankSecurityDesc: 'Your data is protected by state-of-the-art encryption protocols.',
    lightningFastTitle: 'Lightning Fast',
    lightningFastDesc: 'Experience instant load times and seamless transitions.',

    // Login View
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Sign in with your registered NIC or mobile number',
    nicOrMobile: 'NIC / Mobile Number',
    nicPlaceholder: '200012345678 or 07XXXXXXXX',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    orContinueWith: 'OR CONTINUE WITH',
    otpLogin: 'OTP',
    govSsoLogin: 'Gov-SSO',
    newHere: 'New here?',
    createAccount: 'Create an account',

    // Dashboard View - Header
    welcome: 'Welcome back',

    // Dashboard View - Home Tab
    myGarage: 'My Garage',
    manage: 'Manage',
    ticketEvidence: 'Ticket Evidence',
    speedingOffence: 'Speeding — 128 km/h in 100 km/h zone',
    unpaid: 'Unpaid',
    clearStatus: 'Clear',
    pendingFine: 'Pending Fine',
    payFinesNow: 'Pay Fines Now',
    disputeTicket: 'Dispute Ticket',
    nearbyCharging: 'Nearby EV Stations',
    availablePorts: 'ports available',

    // Dashboard View - Garage Tab
    garageTitle: 'My Garage & Fleet',
    registerNewVehicle: '+ Add Vehicle',
    evMap: 'EV Charging Map',
    viewPass: 'View Pass',

    // Dashboard View - Tickets Tab
    trafficTicketsTitle: 'Traffic Fine Tickets',
    payAllFines: 'Pay Selected Fines',
    fineAmount: 'Fine Amount',
    dueDate: 'Due Date',

    // Profile Settings
    profileSettings: 'Profile Settings',
    generalSettings: 'GENERAL SETTINGS',
    personalInfo: 'Personal Information',
    privacySecurity: 'Privacy & Security',
    notifications: 'Notifications',
    language: 'Language',
    supportAbout: 'SUPPORT & ABOUT',
    helpCenter: 'Help Center',
    logOut: 'Log Out Securely',

    // Modals
    editProfileTitle: 'Edit Profile Information',
    fullName: 'Full Name',
    mobileNumber: 'Mobile Number',
    emailAddress: 'Email Address',
    licenseNumber: 'Driving License Number',
    saveChanges: 'Save Profile Changes',
    personalDetails: 'Personal Information Details',
    nicNumber: 'National Identity Card (NIC)',
    twoFactorAuth: 'Two-Factor Authentication (2FA)',
    twoFactorDesc: 'SMS OTP verification required on login',
    updateSecurity: 'Update Security Settings',
    notifPrefs: 'Notification Preferences',
    fineSmsAlerts: 'Traffic Fine Alerts (SMS & In-App)',
    fineSmsDesc: 'Instant alerts when a fine ticket is issued',
    licenseReminders: 'Revenue License Reminders',
    licenseDesc: 'Alerts 30 days before license expiration',
    evStationAlerts: 'EV Station Availability',
    evDesc: 'Real-time charging port status updates',
    govNews: 'Government Transport News',
    newsDesc: 'Updates on Sri Lanka EV policy & tariffs',
    saveNotifs: 'Save Notification Preferences',
    selectLang: 'Select App Language',
    faqTitle: 'Frequently Asked Questions',
    callHotline: 'Call Traffic Police Helpline (1919)'
  },

  Sinhala: {
    // General / Brand
    brandName: 'e-mobility-vehicle-portal',
    portalTitle: 'e-mobility-vehicle-portal',
    portalSubtitle: 'වාහන, දඩ සහ අභියාචනා එකම ස්ථානයකින් පාලනය කරන්න',
    secNote: 'බිටු 256 කේතනය මගින් ආරක්ෂිතයි',
    home: 'මුඛ්‍ය පිටුව',
    garage: 'ගැරාජය',
    tickets: 'දඩ පත්‍රිකා',
    profile: 'ගිණුම',
    features: 'විශේෂාංග',

    // Landing View
    heroSubheading: 'E-MOBILITY-VEHICLE-PORTAL',
    heroFocalTitle: 'අපගේ මීළඟ පරම්පරාවේ ඩිජිටල් වාහන කළමනාකරණ පද්ධතිය අත්විඳින්න.',
    getStarted: 'ආරම්භ කරන්න',
    premiumFeatures: 'විශිෂ්ට විශේෂාංග',
    bankSecurityTitle: 'බැංකු මට්ටමේ ආරක්ෂාව',
    bankSecurityDesc: 'ඔබගේ දත්ත නවීනතම කේතන තාක්ෂණයෙන් ආරක්ෂා කර ඇත.',
    lightningFastTitle: 'අතිශය වේගවත්',
    lightningFastDesc: 'ක්ෂණික ප්‍රවේශය සහ සුමට සංක්‍රමණය අත්විඳින්න.',

    // Login View
    welcomeBack: 'සාදරයෙන් පිළිගනිමු',
    loginSubtitle: 'ඔබගේ ජාතික හැඳුනුම්පත් අංකය හෝ ජංගම දුරකථන අංකයෙන් පිවිසෙන්න',
    nicOrMobile: 'හැඳුනුම්පත / ජංගම දුරකථන අංකය',
    nicPlaceholder: '200012345678 හෝ 07XXXXXXXX',
    password: 'මුරපදය',
    rememberMe: 'මතක තබා ගන්න',
    forgotPassword: 'මුරපදය අමතකද?',
    signIn: 'ඇතුළු වන්න',
    signingIn: 'ඇතුළු වෙමින් පවතී...',
    orContinueWith: 'හෝ වෙනත් ක්‍රමයකින් පිවිසෙන්න',
    otpLogin: 'OTP අංකය',
    govSsoLogin: 'Gov-SSO',
    newHere: 'නව පරිශීලකයෙක්ද?',
    createAccount: 'ගිණුමක් සාදන්න',

    // Dashboard View - Header
    welcome: 'සාදරයෙන් පිළිගනිමු',

    // Dashboard View - Home Tab
    myGarage: 'මගේ ගැරාජය',
    manage: 'කළමනාකරණය',
    ticketEvidence: 'දඩ පත්‍රිකා සාක්ෂි',
    speedingOffence: 'අධික වේගය — 100 km/h සීමාවේ 128 km/h',
    unpaid: 'ගෙවා නැත',
    clearStatus: 'පැහැදිලියි',
    pendingFine: 'ගෙවිය යුතු දඩයක් ඇත',
    payFinesNow: 'දඩ මුදල දැන් ගෙවන්න',
    disputeTicket: 'අභියාචනා කරන්න',
    nearbyCharging: 'ආසන්න EV චාජර් මධ්‍යස්ථාන',
    availablePorts: 'චාජර් පෝට් ඇත',

    // Dashboard View - Garage Tab
    garageTitle: 'මගේ ගැරාජය සහ වාහන',
    registerNewVehicle: '+ වාහනයක් එක් කරන්න',
    evMap: 'EV චාජර් සිතියම',
    viewPass: 'ඩිජිටල් පාස් එක බලන්න',

    // Dashboard View - Tickets Tab
    trafficTicketsTitle: 'රථවාහන දඩ පත්‍රිකා',
    payAllFines: 'තෝරාගත් දඩ ගෙවන්න',
    fineAmount: 'දඩ මුදල',
    dueDate: 'අවසන් දිනය',

    // Profile Settings
    profileSettings: 'ගිණුම් සැකසීම්',
    generalSettings: 'සාමාන්‍ය සැකසීම්',
    personalInfo: 'පෞද්ගලික තොරතුරු',
    privacySecurity: 'ආරක්ෂාව සහ රහස්‍යතාව',
    notifications: 'දැනුම්දීම්',
    language: 'භාෂාව',
    supportAbout: 'සහාය සහ තොරතුරු',
    helpCenter: 'සහාය මධ්‍යස්ථානය',
    logOut: 'සුරක්ෂිතව ඉවත් වන්න',

    // Modals
    editProfileTitle: 'ගිණුම් තොරතුරු සංස්කරණය',
    fullName: 'සම්පූර්ණ නම',
    mobileNumber: 'ජංගම දුරකථන අංකය',
    emailAddress: 'විද්‍යුත් තැපෑල',
    licenseNumber: 'රියදුරු බලපත්‍ර අංකය',
    saveChanges: 'තොරතුරු සුරකින්න',
    personalDetails: 'පෞද්ගලික තොරතුරු විස්තර',
    nicNumber: 'ජාතික හැඳුනුම්පත් අංකය (NIC)',
    twoFactorAuth: 'දෙපියවර සත්‍යාපනය (2FA)',
    twoFactorDesc: 'පිවිසීමේදී SMS OTP අංකයක් අවශ්‍ය වේ',
    updateSecurity: 'ආරක්ෂිත සැකසීම් යාවත්කාලීන කරන්න',
    notifPrefs: 'දැනුම්දීම් මනාපයන්',
    fineSmsAlerts: 'රථවාහන දඩ SMS දැනුම්දීම්',
    fineSmsDesc: 'දඩයක් පැනවූ සැනින් SMS පණිවුඩ ලබා දෙයි',
    licenseReminders: 'ආදායම් බලපත්‍ර මතක් කිරීම්',
    licenseDesc: 'බලපත්‍රය කල් ඉකුත්වීමට දින 30 කට පෙර දැනුම් දෙයි',
    evStationAlerts: 'EV චාජර් මධ්‍යස්ථාන තොරතුරු',
    evDesc: 'චාජර් පෝට් පවතින බව සජීවීව දැනුම් දෙයි',
    govNews: 'රජයේ ප්‍රවාහන පුවත්',
    newsDesc: 'ඊ-මොබිලිටි ප්‍රතිපත්ති සහ ගාස්තු යාවත්කාලීන කිරීම්',
    saveNotifs: 'මනාපයන් සුරකින්න',
    selectLang: 'භාෂාව තෝරන්න',
    faqTitle: 'නිතර අසන ප්‍රශ්න',
    callHotline: 'රථවාහන පොලිස් හදිසි ඇමතුම් (1919)'
  },

  Tamil: {
    // General / Brand
    brandName: 'e-mobility-vehicle-portal',
    portalTitle: 'e-mobility-vehicle-portal',
    portalSubtitle: 'வாகனங்கள், அபராதங்கள் மற்றும் மேல்முறையீடுகளை ஒரே இடத்தில் நிர்வகிக்கவும்',
    secNote: '256-பிட் குறியாக்கத்துடன் பாதுகாக்கப்பட்டது',
    home: 'முகப்பு',
    garage: 'கேரேஜ்',
    tickets: 'அபராதங்கள்',
    profile: 'சுயவிவரம்',
    features: 'அம்சங்கள்',

    // Landing View
    heroSubheading: 'E-MOBILITY-VEHICLE-PORTAL',
    heroFocalTitle: 'எங்களின் அடுத்த தலைமுறை டிஜிட்டல் வாகன மேலாண்மை அமைப்பை அனுபவியுங்கள்.',
    getStarted: 'தொடங்கவும்',
    premiumFeatures: 'சிறப்பு அம்சங்கள்',
    bankSecurityTitle: 'வங்கி நிலை பாதுகாப்பு',
    bankSecurityDesc: 'உங்கள் தரவு நவீன குறியாக்க நுட்பங்களால் பாதுகாக்கப்படுகிறது.',
    lightningFastTitle: 'மிக்க அதிவேகம்',
    lightningFastDesc: 'உடனடி அணுகல் மற்றும் தடையற்ற மாற்றங்களை அனுபவியுங்கள்.',

    // Login View
    welcomeBack: 'மீண்டும் வருக',
    loginSubtitle: 'உங்கள் NIC அல்லது மொபைல் எண்ணைப் பயன்படுத்தி உள்நுழையவும்',
    nicOrMobile: 'NIC / மொபைல் எண்',
    nicPlaceholder: '200012345678 அல்லது 07XXXXXXXX',
    password: 'கடவுச்சொல்',
    rememberMe: 'என்னை நினைவில் கொள்க',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signIn: 'உள்நுழைக',
    signingIn: 'உள்நுழைகிறது...',
    orContinueWith: 'அல்லது இதன் மூலம் தொடரவும்',
    otpLogin: 'OTP',
    govSsoLogin: 'Gov-SSO',
    newHere: 'புதியவரா?',
    createAccount: 'கணக்கை உருவாக்கவும்',

    // Dashboard View - Header
    welcome: 'மீண்டும் வருக',

    // Dashboard View - Home Tab
    myGarage: 'எனது கேரேஜ்',
    manage: 'நிர்வகி',
    ticketEvidence: 'அபராத சான்றுகள்',
    speedingOffence: 'அதிவேகம் — 100 km/h எல்லையில் 128 km/h',
    unpaid: 'செலுத்தப்படவில்லை',
    clearStatus: 'தெளிவானது',
    pendingFine: 'நிலுவையில் உள்ள அபராதம்',
    payFinesNow: 'அபராதத்தை இப்போது செலுத்துங்கள்',
    disputeTicket: 'மேல்முறையீடு செய்',
    nearbyCharging: 'அருகிலுள்ள EV சார்ஜிங் நிலையங்கள்',
    availablePorts: 'சார்ஜிங் போர்ட்கள் உள்ளன',

    // Dashboard View - Garage Tab
    garageTitle: 'எனது கேரேஜ் & வாகனங்கள்',
    registerNewVehicle: '+ வாகனத்தைச் சேர்',
    evMap: 'EV சார்ஜர் வரைபடம்',
    viewPass: 'டிஜிட்டல் பாஸைப் பார்',

    // Dashboard View - Tickets Tab
    trafficTicketsTitle: 'போக்குவரத்து அபராத சீட்டுகள்',
    payAllFines: 'தேர்ந்தெடுக்கப்பட்ட அபராதங்களைச் செலுத்துங்கள்',
    fineAmount: 'அபராதத் தொகை',
    dueDate: 'கடைசி தேதி',

    // Profile Settings
    profileSettings: 'சுயவிவர அமைப்புகள்',
    generalSettings: 'பொதுவான அமைப்புகள்',
    personalInfo: 'தனிப்பட்ட தகவல்கள்',
    privacySecurity: 'பாதுகாப்பு & தனியுரிமை',
    notifications: 'அறிவிப்புகள்',
    language: 'மொழி',
    supportAbout: 'ஆதரவு & விபரம்',
    helpCenter: 'உதவி மையம்',
    logOut: 'பாதுகாப்பாக வெளியேறு',

    // Modals
    editProfileTitle: 'சுயவிவரத்தைத் திருத்து',
    fullName: 'முழு பெயர்',
    mobileNumber: 'மொபைல் எண்',
    emailAddress: 'மின்னஞ்சல்',
    licenseNumber: 'சாரதி அனுமதிப்பத்திர எண்',
    saveChanges: 'மாற்றங்களைச் சேமிக்கவும்',
    personalDetails: 'தனிப்பட்ட தகவல் விபரங்கள்',
    nicNumber: 'தேசிய அடையாள அட்டை எண் (NIC)',
    twoFactorAuth: 'இரண்டு காரணி அங்கீகாரம் (2FA)',
    twoFactorDesc: 'உள்நுழையும்போது SMS OTP தேவைப்படும்',
    updateSecurity: 'பாதுகாப்பை புதுப்பிக்கவும்',
    notifPrefs: 'அறிவிப்பு விருப்பத்தேர்வுகள்',
    fineSmsAlerts: 'அபராத SMS அறிவிப்புகள்',
    fineSmsDesc: 'அபராதம் விதிக்கப்பட்டவுடன் உடனடி SMS',
    licenseReminders: 'வருமான உரிம நினைவூட்டல்கள்',
    licenseDesc: 'உரிமம் காலாவதியாவதற்கு 30 நாட்களுக்கு முன்',
    evStationAlerts: 'EV சார்ஜிங் நிலைய விபரங்கள்',
    evDesc: 'சார்ஜிங் போர்ட் நிலை நேரடி புதுப்பிப்புகள்',
    govNews: 'அரச போக்குவரத்து செய்திகள்',
    newsDesc: 'ஈ-மொபிலிட்டி கொள்கை மற்றும் கட்டணப் புதுப்பிப்புகள்',
    saveNotifs: 'விருப்பங்களைச் சேமிக்கவும்',
    selectLang: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    callHotline: 'போக்குவரத்து பொலிஸ் உதவி எண் (1919)'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    return saved && translations[saved] ? saved : 'English';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key) => {
    const langDict = translations[language] || translations.English;
    return langDict[key] || translations.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

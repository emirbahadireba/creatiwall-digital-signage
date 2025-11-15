import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Palette,
  Zap,
  Shield,
  Users,
  BarChart3,
  Play,
  Star,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Tv,
  Globe,
  Clock,
  Settings,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  Database,
  Headphones,
  Award,
  TrendingUp,
  Eye,
  Lightbulb,
  Target,
  Rocket,
  Heart,
  MessageCircle,
  Calendar,
  DollarSign,
  Car
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Palette className="w-8 h-8 text-primary" />,
      title: "Sürükle & Bırak Tasarım",
      description: "Kolay kullanımlı drag & drop editörü ile profesyonel layout'lar oluşturun. Kod bilgisi gerektirmez."
    },
    {
      icon: <Monitor className="w-8 h-8 text-primary" />,
      title: "Çoklu Ekran Desteği",
      description: "Sınırsız sayıda ekranı tek merkezden yönetin ve kontrol edin. Grup yönetimi ile toplu işlemler yapın."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Gerçek Zamanlı Güncelleme",
      description: "İçeriklerinizi anında güncelleyin, değişiklikler hemen yansısın. WebSocket teknolojisi ile hızlı iletişim."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Akıllı Zamanlama",
      description: "İçeriklerinizi istediğiniz tarih ve saatlerde otomatik olarak yayınlayın. Tekrarlayan programlar oluşturun."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Widget Marketplace",
      description: "Hava durumu, haberler, sosyal medya ve daha fazlası için hazır widget'lar. Kendi widget'larınızı da ekleyin."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Güvenli & Stabil",
      description: "Kurumsal düzeyde güvenlik ve 7/24 kesintisiz çalışma garantisi. SSL şifreleme ve yedekleme sistemi."
    },
    {
      icon: <Database className="w-8 h-8 text-primary" />,
      title: "Bulut Tabanlı",
      description: "Verileriniz güvenli bulut sunucularında saklanır. Her yerden erişim, otomatik yedekleme."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Detaylı Analitik",
      description: "Ekran performansı, izleyici etkileşimi ve içerik başarı oranları hakkında detaylı raporlar."
    },
    {
      icon: <Headphones className="w-8 h-8 text-primary" />,
      title: "7/24 Teknik Destek",
      description: "Uzman ekibimiz her zaman yanınızda. Canlı destek, telefon ve e-posta ile hızlı çözüm."
    }
  ];

  const stats = [
    { number: "2500+", label: "Aktif Kullanıcı", icon: <Users className="w-6 h-6" /> },
    { number: "15000+", label: "Yönetilen Ekran", icon: <Monitor className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime Oranı", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "24/7", label: "Teknik Destek", icon: <Headphones className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      company: "TechCorp AVM",
      position: "IT Müdürü",
      text: "CreatiWall sayesinde 50+ ekranımızı tek merkezden yönetiyoruz. Müşteri deneyimi %40 arttı, operasyonel maliyetler %30 azaldı!",
      rating: 5,
      image: "👨‍💼"
    },
    {
      name: "Elif Kaya",
      company: "Modern Otel Zinciri",
      position: "Pazarlama Direktörü",
      text: "Otellerimizde misafir bilgilendirme sistemini tamamen dijitalleştirdik. Misafir memnuniyeti rekor seviyede!",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "Mehmet Demir",
      company: "Eğitim Kurumu",
      position: "Bilgi İşlem Sorumlusu",
      text: "Kampüsümüzdeki tüm bilgilendirme ekranlarını CreatiWall ile yönetiyoruz. Öğrenciler artık daha bilgili!",
      rating: 5,
      image: "👨‍🏫"
    },
    {
      name: "Zeynep Özkan",
      company: "Sağlık Grubu",
      position: "Operasyon Müdürü",
      text: "Hastanelerimizde hasta bilgilendirme ve yönlendirme sistemlerini modernleştirdik. Harika sonuçlar!",
      rating: 5,
      image: "👩‍⚕️"
    }
  ];

  const pricingPlans = [
    {
      name: "Başlangıç",
      price: "₺299",
      period: "/ay",
      description: "Küçük işletmeler için ideal",
      features: [
        "5 ekrana kadar",
        "Temel widget'lar",
        "E-posta desteği",
        "Temel analitik",
        "1 GB depolama",
        "Standart şablonlar"
      ],
      popular: false,
      color: "border-border"
    },
    {
      name: "Profesyonel",
      price: "₺599",
      period: "/ay",
      description: "Büyüyen işletmeler için",
      features: [
        "25 ekrana kadar",
        "Tüm widget'lar",
        "Öncelikli destek",
        "Gelişmiş analitik",
        "10 GB depolama",
        "Özel şablonlar",
        "API erişimi",
        "Zamanlama özellikleri"
      ],
      popular: true,
      color: "border-primary"
    },
    {
      name: "Kurumsal",
      price: "₺1299",
      period: "/ay",
      description: "Büyük organizasyonlar için",
      features: [
        "Sınırsız ekran",
        "Özel widget geliştirme",
        "7/24 telefon desteği",
        "Kurumsal analitik",
        "100 GB depolama",
        "Beyaz etiket çözümü",
        "Özel entegrasyonlar",
        "Eğitim ve danışmanlık",
        "SLA garantisi"
      ],
      popular: false,
      color: "border-accent"
    }
  ];

  const faqs = [
    {
      question: "CreatiWall nasıl çalışır?",
      answer: "CreatiWall bulut tabanlı bir dijital tabela yönetim sistemidir. Web paneli üzerinden içeriklerinizi oluşturup, ekranlarınıza anlık olarak gönderebilirsiniz. Ekranlarınız internet bağlantısı olan herhangi bir cihaz olabilir."
    },
    {
      question: "Hangi cihazları destekliyorsunuz?",
      answer: "Android TV, Smart TV, tablet, bilgisayar, Raspberry Pi ve web tarayıcısı olan tüm cihazları destekliyoruz. Özel donanım gerektirmez, mevcut cihazlarınızı kullanabilirsiniz."
    },
    {
      question: "İçerik oluşturmak ne kadar sürer?",
      answer: "Sürükle-bırak editörümüz sayesinde dakikalar içinde profesyonel içerikler oluşturabilirsiniz. Hazır şablonlarımızı kullanarak daha da hızlı başlayabilirsiniz."
    },
    {
      question: "Verilerim güvende mi?",
      answer: "Evet, tüm verileriniz SSL şifreleme ile korunur ve güvenli bulut sunucularında saklanır. Düzenli yedekleme ve 99.9% uptime garantisi sunuyoruz."
    },
    {
      question: "Teknik destek alabilir miyim?",
      answer: "Tabii ki! 7/24 teknik destek ekibimiz e-posta, telefon ve canlı destek ile hizmetinizdedir. Kurulum, eğitim ve sorun çözme konularında yardımcı oluyoruz."
    },
    {
      question: "Ücretsiz deneme var mı?",
      answer: "Evet! 14 gün ücretsiz deneme sürümümüz ile tüm özelliklerimizi test edebilirsiniz. Kredi kartı bilgisi gerektirmez."
    },
    {
      question: "Fiyatlandırma nasıl çalışır?",
      answer: "Aylık abonelik modelimiz var. İstediğiniz zaman planınızı değiştirebilir veya iptal edebilirsiniz. Yıllık ödemede %20 indirim sunuyoruz."
    },
    {
      question: "API entegrasyonu mümkün mü?",
      answer: "Evet, RESTful API'miz ile kendi sistemlerinizle entegrasyon yapabilirsiniz. Dokümantasyon ve örnek kodlar mevcuttur."
    }
  ];

  const useCases = [
    { 
      icon: <Tv className="w-12 h-12" />, 
      title: "Perakende & AVM", 
      desc: "Mağaza vitrinleri, kampanya duyuruları, ürün tanıtımları",
      examples: ["Dinamik fiyat gösterimi", "Kampanya duyuruları", "Ürün katalogları", "Müşteri yönlendirme"]
    },
    { 
      icon: <Users className="w-12 h-12" />, 
      title: "Kurumsal", 
      desc: "Ofis bilgilendirme, toplantı odaları, KPI gösterimi",
      examples: ["Şirket haberleri", "Toplantı programları", "Performans metrikleri", "Güvenlik bildirimleri"]
    },
    { 
      icon: <Smartphone className="w-12 h-12" />, 
      title: "Otel & Turizm", 
      desc: "Misafir bilgilendirme, etkinlik duyuruları, menüler",
      examples: ["Check-in/out bilgileri", "Etkinlik programları", "Restoran menüleri", "Yerel hava durumu"]
    },
    { 
      icon: <Settings className="w-12 h-12" />, 
      title: "Eğitim", 
      desc: "Kampüs duyuruları, ders programları, etkinlikler",
      examples: ["Ders programları", "Sınav duyuruları", "Etkinlik takvimi", "Acil durum bildirimleri"]
    },
    { 
      icon: <Heart className="w-12 h-12" />, 
      title: "Sağlık", 
      desc: "Hasta bilgilendirme, randevu sistemi, yönlendirme",
      examples: ["Randevu çağrıları", "Bölüm yönlendirme", "Sağlık tavsiyeleri", "Bekleme süresi"]
    },
    { 
      icon: <Car className="w-12 h-12" />, 
      title: "Ulaşım", 
      desc: "Sefer bilgileri, gecikme duyuruları, haritalar",
      examples: ["Sefer saatleri", "Gecikme bildirimleri", "Güzergah haritaları", "Hava durumu"]
    }
  ];

  const menuItems = [
    { name: "Ana Sayfa", href: "#hero" },
    { name: "Özellikler", href: "#features" },
    { name: "Fiyatlandırma", href: "#pricing" },
    { name: "Müşteriler", href: "#testimonials" },
    { name: "SSS", href: "#faq" },
    { name: "İletişim", href: "#contact" }
  ];

  const handleMenuClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f0f5' }}>
      {/* Header */}
      <header className="backdrop-blur-sm sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #ffc000 0%, #ffb000 50%, #ff9500 100%)', boxShadow: '0 4px 15px rgba(255, 192, 0, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 px-6">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="CreatiWall Logo"
                className="h-16 w-auto object-contain scale-[2.5]"
              />
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item.href)}
                  className="text-gray-800 hover:text-gray-900 transition-colors font-medium"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-6 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center space-x-2 font-bold"
                style={{ color: '#ffc000' }}
              >
                <span>Sisteme Giriş</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#ffc000' }} />
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-800 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-400">
              <nav className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleMenuClick(item.href)}
                    className="text-gray-800 hover:text-gray-900 transition-colors font-medium text-left"
                  >
                    {item.name}
                  </button>
                ))}
                <Link
                  to="/login"
                  className="inline-flex px-6 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center space-x-2 w-fit font-bold"
                  style={{ color: '#ffc000' }}
                >
                  <span>Sisteme Giriş</span>
                  <ArrowRight className="w-4 h-4" style={{ color: '#ffc000' }} />
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="py-20" style={{ background: 'linear-gradient(135deg, #f0f0f5 0%, #ffffff 50%, #f0f0f5 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Rocket className="w-4 h-4 mr-2" />
                Türkiye'nin En Gelişmiş Dijital Tabela Platformu
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Dijital Tabela
                <span className="text-primary block">Yönetiminde</span>
                Yeni Çağ
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                CreatiWall ile dijital ekranlarınızı profesyonelce yönetin. 
                Sürükle-bırak editörü, gerçek zamanlı güncelleme ve akıllı zamanlama özellikleri ile 
                içerik yönetimi hiç bu kadar kolay olmamıştı.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 text-lg font-semibold"
                >
                  <Play className="w-5 h-5" />
                  <span>14 Gün Ücretsiz Deneyin</span>
                </Link>
                <button className="px-8 py-4 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-lg">
                  <Eye className="w-5 h-5" />
                  <span>Canlı Demo İzleyin</span>
                </button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Kredi kartı gerektirmez</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Anında kurulum</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-300" style={{ backgroundColor: '#ffffff' }}>
                  <div className="bg-primary/10 p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="ml-4 text-sm font-semibold text-gray-800">CreatiWall Dashboard</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-primary/10 rounded-lg p-4 text-center">
                        <Monitor className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900">Layout Designer</p>
                        <p className="text-xs font-medium text-gray-700">Sürükle & Bırak</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 text-center">
                        <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900">Analytics</p>
                        <p className="text-xs font-medium text-gray-700">Gerçek Zamanlı</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900">Aktif Ekranlar</span>
                        <span className="text-primary font-bold">24/7</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-4/5"></div>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-700 mt-1">
                        <span>1,247 Online</span>
                        <span>98.7% Uptime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: '#f8f8fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              Güçlü Özellikler
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden CreatiWall?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern işletmelerin dijital tabela ihtiyaçları için tasarlanmış, 
              güçlü ve kullanıcı dostu özellikler
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-xl p-6 border border-gray-300 hover:shadow-lg transition-all hover:border-primary/50" style={{ backgroundColor: '#ffffff' }}>
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20" style={{ backgroundColor: '#f8f8fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Kullanım Alanları
            </div>
            <h2 className="text-4xl font-bold text-text mb-4">
              CreatiWall'u Hangi Sektörlerde Kullanabilirsiniz?
            </h2>
            <p className="text-xl text-textSecondary">
              Her sektörden binlerce müşterimiz CreatiWall ile dijital dönüşümlerini gerçekleştirdi
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="rounded-xl p-6 border border-gray-300 hover:shadow-lg transition-all hover:border-accent/50" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-accent mb-4 flex justify-center">
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-semibold text-text mb-2 text-center">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  {useCase.desc}
                </p>
                <div className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <DollarSign className="w-4 h-4 mr-2" />
              Şeffaf Fiyatlandırma
            </div>
            <h2 className="text-4xl font-bold text-text mb-4">
              Size Uygun Planı Seçin
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              İhtiyacınıza göre ölçeklenebilir planlar. İstediğiniz zaman değiştirebilir veya iptal edebilirsiniz.
            </p>
            <div className="inline-flex items-center rounded-lg p-1 border border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
                Aylık
              </button>
              <button className="px-4 py-2 text-gray-600 text-sm font-medium">
                Yıllık (20% İndirim)
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-xl p-8 border-2 ${plan.color} relative ${plan.popular ? 'shadow-xl scale-105' : 'hover:shadow-lg'} transition-all`} style={{ backgroundColor: '#ffffff' }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      En Popüler
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                }`} style={!plan.popular ? { backgroundColor: '#f8f8fc' } : {}}>
                  {plan.popular ? 'Hemen Başlayın' : 'Planı Seçin'}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Daha büyük ihtiyaçlarınız mı var? Özel çözümler için bizimle iletişime geçin.
            </p>
            <button className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
              Kurumsal Çözümler
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20" style={{ backgroundColor: '#f8f8fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Müşteri Memnuniyeti
            </div>
            <h2 className="text-4xl font-bold text-text mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-textSecondary">
              Binlerce memnun müşterimizden bazı görüşler
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-xl p-6 border border-gray-300 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {testimonial.position}
                    </div>
                    <div className="text-xs text-gray-600">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Sık Sorulan Sorular
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Merak Ettikleriniz
            </h2>
            <p className="text-xl text-gray-600">
              En çok sorulan sorular ve cevapları
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-gray-300 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: '#f8f8fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Phone className="w-4 h-4 mr-2" />
              İletişim
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-gray-600">
              Sorularınız için 7/24 buradayız. Size en uygun iletişim kanalını seçin.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600">+90 212 555 0123</p>
              <p className="text-sm text-gray-600">7/24 Destek Hattı</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600">info@creatiwall.com</p>
              <p className="text-sm text-gray-600">24 saat içinde yanıt</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Canlı Destek</h3>
              <p className="text-gray-600">Anında yardım</p>
              <p className="text-sm text-gray-600">09:00 - 18:00</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">İstanbul, Türkiye</p>
              <p className="text-sm text-gray-600">Merkez Ofis</p>
            </div>
          </div>
          <div className="rounded-xl p-8 border border-gray-300" style={{ backgroundColor: '#ffffff' }}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Demo Talep Edin</h3>
                <p className="text-gray-600 mb-6">
                  Uzman ekibimizden kişiselleştirilmiş bir demo alın ve CreatiWall'un 
                  işletmenize nasıl değer katacağını keşfedin.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">30 dakikalık kişisel demo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">İhtiyaç analizi</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Özel fiyat teklifi</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ad Soyad</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">E-posta</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="ornek@sirket.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Şirket</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Şirket adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ekran Sayısı</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" style={{ backgroundColor: '#ffffff' }}>
                    <option>1-5 ekran</option>
                    <option>6-25 ekran</option>
                    <option>26-100 ekran</option>
                    <option>100+ ekran</option>
                  </select>
                </div>
                <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Demo Talep Et
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Dijital Dönüşümünüzü Bugün Başlatın
          </h2>
          <p className="text-xl text-white/90 mb-8">
            CreatiWall ile dijital tabela yönetiminizi profesyonelleştirin. 
            14 gün ücretsiz deneme sürümü ile hemen başlayın!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              <Play className="w-5 h-5" />
              <span>Ücretsiz Başlayın</span>
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary transition-colors flex items-center justify-center space-x-2 text-lg">
              <Calendar className="w-5 h-5" />
              <span>Demo Randevusu</span>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-4">
            Kredi kartı gerektirmez • Anında kurulum • 7/24 destek
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-12" style={{ backgroundColor: '#f8f8fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">CreatiWall</h3>
                </div>
              </div>
              <p className="text-textSecondary text-sm mb-4 max-w-md">
                Dijital tabela yönetiminde yeni nesil çözümler sunan, 
                güvenilir ve kullanıcı dostu platform. Türkiye'nin en gelişmiş 
                dijital signage sistemi.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li><a href="#features" className="hover:text-primary transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Widget Marketplace</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Entegrasyonlar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">Destek</h4>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li><a href="#" className="hover:text-primary transition-colors">Yardım Merkezi</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Canlı Destek</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Eğitim Videoları</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sistem Durumu</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li><a href="#" className="hover:text-primary transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Basın Kiti</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Gizlilik Politikası</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-textSecondary text-sm">
                © 2024 CreatiWall. Tüm hakları saklıdır. Dijital tabela yönetiminde güvenilir çözüm ortağınız.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">
                  Kullanım Şartları
                </a>
                <a href="#" className="text-textSecondary hover:text-primary text-sm transition-colors">
                  Gizlilik
                </a>
                <a href="#" className="text-textSecondary hover:text-primary text-sm transition-colors">
                  Çerezler
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
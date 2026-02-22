import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Buat Gambar Indah dengan
                <span className="block gradient-text">Teknologi Bertenaga AI</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10">
                Ubah ide Anda menjadi visual yang memukau dengan generator gambar AI kami yang canggih. Ketik deskripsi, klik tombol, dan saksikan imajinasi Anda menjadi nyata.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <CustomButton variant="gradient" size="lg" className="text-base">
                    Mulai Sekarang
                  </CustomButton>
                </Link>
                <Link to="#demo">
                  <CustomButton variant="outline" size="lg" className="text-base">
                    Lihat Contoh
                  </CustomButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Fitur Unggulan</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-background rounded-lg p-6 shadow-sm">
                  <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="demo" className="py-20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Lihat Apa yang Bisa Dibuat</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examples.map((example, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                  <div className="aspect-[4/3] bg-accent/30 rounded-lg animate-pulse-slow"></div>
                  <p className="mt-3 text-sm text-center text-muted-foreground">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-secondary">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pilihan Paket</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`bg-background rounded-lg overflow-hidden shadow-sm ${plan.popular ? "border-2 border-primary relative" : "border border-muted"}`}>
                  {plan.popular && <div className="bg-primary text-primary-foreground text-xs font-medium py-1 text-center">Paling Populer</div>}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/bulan</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup">
                      <CustomButton variant={plan.popular ? "gradient" : "outline"} className="w-full">
                        Pilih Paket
                      </CustomButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-creative-gradient text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Membuat Gambar Luar Biasa?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Bergabunglah dengan ribuan pengguna yang telah mengubah ide mereka menjadi visual yang indah.</p>
            <Link to="/signup">
              <CustomButton variant="default" size="lg" className="bg-white text-primary hover:bg-white/90">
                Mulai Berkreasi Sekarang
              </CustomButton>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <Link to="/" className="text-xl font-bold gradient-text">
                  PembuatGambar
                </Link>
                <p className="text-sm text-muted-foreground mt-2">© 2025 PembuatGambar. Hak cipta dilindungi.</p>
              </div>
              <div className="flex gap-8">
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Kebijakan Privasi
                </Link>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Syarat & Ketentuan
                </Link>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Kontak
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

// Mock data (Translated)
const features = [
  {
    icon: <span className="text-xl">✨</span>,
    title: "Gambar Berkualitas Tinggi",
    description: "Hasilkan gambar resolusi tinggi yang memukau dan siap digunakan dalam proyek Anda.",
  },
  {
    icon: <span className="text-xl">⚡</span>,
    title: "Pembuatan Cepat",
    description: "Dapatkan gambar Anda dalam hitungan detik dengan mesin generasi AI kami yang optimal.",
  },
  {
    icon: <span className="text-xl">🎨</span>,
    title: "Gaya yang Dapat Disesuaikan",
    description: "Pilih dari berbagai gaya artistik yang sesuai dengan visi kreatif Anda.",
  },
  {
    icon: <span className="text-xl">💾</span>,
    title: "Simpan & Ekspor",
    description: "Simpan gambar Anda dengan mudah dan ekspor dalam berbagai format.",
  },
  {
    icon: <span className="text-xl">📱</span>,
    title: "Ramah Seluler",
    description: "Buat gambar di mana saja dengan pengalaman seluler kami yang responsif sepenuhnya.",
  },
  {
    icon: <span className="text-xl">🔄</span>,
    title: "Variasi Tak Terbatas",
    description: "Hasilkan berbagai variasi ide Anda hingga Anda menemukan yang sempurna.",
  },
];

const examples = [
  "Pemandangan kota futuristik dengan mobil terbang dan lampu neon",
  "Pemandangan gunung yang tenang saat matahari terbenam dengan danau yang memantulkan bayangan",
  "Potret fotorealistik karakter fantasi dengan elemen magis",
  "Representasi abstrak emosi menggunakan warna dan bentuk yang cerah",
  "Ilustrasi detail pemandangan bawah laut dengan makhluk laut eksotis",
  "Asisten robot fiksi ilmiah di ruang tamu modern",
];

const pricingPlans = [
  {
    name: "Gratis",
    price: 0,
    description: "Sempurna untuk mencoba platform kami",
    features: ["20 gambar per bulan", "Kualitas generasi standar", "Alat pengeditan dasar", "5 gambar tersimpan"],
    popular: false,
  },
  {
    name: "Pro",
    price: 15,
    description: "Untuk individu yang membutuhkan daya lebih",
    features: ["200 gambar per bulan", "Generasi berkualitas tinggi", "Alat pengeditan lanjutan", "Penyimpanan gambar tak terbatas", "Pemrosesan prioritas"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 49,
    description: "Untuk tim dan penggunaan profesional",
    features: ["Gambar tak terbatas", "Generasi kualitas maksimum", "Semua alat pengeditan", "Akses API", "Dukungan khusus", "Lisensi komersial"],
    popular: false,
  },
];

export default Index;

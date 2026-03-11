import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock, HeartHandshake, Sparkles, ChevronRight, Star, CheckCircle, MapPin, Phone, Mail } from 'lucide-react';
import { FadeInUp, ScaleIn, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { AnimatedFAQ } from '@/components/AnimatedFAQ';

export default function Home() {
  return (
    <main style={{ overflowX: 'hidden' }}>

      {/* Background Blobs */}
      <div className="blob animate-blob" style={{ top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'var(--primary-light)' }} />
      <div className="blob animate-blob" style={{ top: '40%', right: '-20%', width: '800px', height: '800px', background: 'rgba(56, 189, 248, 0.1)', animationDelay: '-10s' }} />

      {/* Navigation */}
      <nav className="glass-panel" style={{ position: 'sticky', top: '1rem', zIndex: 100, margin: '1rem auto', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.05em' }}>Tandartspraktijk Stralend</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="#over-ons" style={{ fontWeight: 500 }} className="hover:text-primary transition-colors">Onze Praktijk</Link>
          <Link href="#diensten" style={{ fontWeight: 500 }} className="hover:text-primary transition-colors">Behandelingen</Link>
          <Link href="#contact" style={{ fontWeight: 500 }} className="hover:text-primary transition-colors">Contact</Link>
          <Link href="/boeken" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Afspraak Maken</Link>
          <Link href="/inschrijven" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }}>Inschrijven</Link>
          <Link href="/login" className="hover:text-primary transition-colors" style={{ fontWeight: 500 }}>Inloggen</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', marginTop: '-3rem' }}>
        <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
          <div style={{ paddingRight: '2rem' }}>
            <FadeInUp delay={0.1}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
                <Sparkles size={16} /> Expertise • Innovatie • Comfort • Zorg
              </div>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <h1 style={{ fontSize: '4.5rem', margin: '0 0 1rem 0', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                Uw Vertrouwde <span className="text-gradient">Tandarts</span>
              </h1>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 1.5rem 0', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Voor een Gezonde Glimlach!
              </h2>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <p style={{ fontSize: '1.25rem', margin: '0 0 2.5rem 0', color: 'var(--secondary)', lineHeight: 1.7 }}>
                Bij Tandartspraktijk Stralend bieden wij hoogwaardige tandheelkundige zorg met een persoonlijke benadering. Of u nu komt voor een periodieke controle, professionele reiniging of een gespecialiseerde behandeling – ons ervaren team staat voor u klaar. Wij hechten veel waarde aan uw comfort en mondgezondheid, zodat u zich op uw gemak voelt in een ontspannen omgeving.
              </p>
            </FadeInUp>
            <FadeInUp delay={0.4}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/boeken" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', gap: '0.5rem' }}>INSCHRIJVEN <ChevronRight size={20} /></Link>
                <Link href="#contact" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>Bel Ons Nu</Link>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div style={{ marginTop: '3.5rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#fef08a', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><Star fill="#ca8a04" color="#ca8a04" size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>2,000+</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tevreden Patiënten</div>
                  </div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'var(--surface-border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', display: 'flex', color: 'var(--primary)' }}><ShieldCheck size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>10+ jaar</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ervaring</div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          <ScaleIn delay={0.3}>
            <div className="image-wrapper" style={{ height: '650px', display: 'flex', transform: 'perspective(1000px) rotateY(-5deg)', boxShadow: '25px 25px 50px rgba(0,0,0,0.1)' }}>
              <Image
                src="/images/hero.png"
                alt="Tandartspraktijk Stralend interieur"
                width={800}
                height={800}
                className="hero-image animate-float"
                priority
              />
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section container" style={{ padding: '4rem 1.5rem' }}>
        <FadeInUp>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem' }}>Waarom kiezen voor ons?</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>Vertrouwde zorg voor een stralende glimlach</p>
          </div>
        </FadeInUp>

        <StaggerContainer className="grid-3">
          <StaggerItem>
            <div className="glass-panel hover-card" style={{ padding: '2.5rem', height: '100%', background: 'var(--surface)' }}>
              <div style={{ background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ervaren Team</h3>
              <p style={{ margin: 0 }}>Deskundige tandartsen & mondhygiënisten met jarenlange ervaring.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="glass-panel hover-card" style={{ padding: '2.5rem', height: '100%', background: 'var(--surface)' }}>
              <div style={{ background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Moderne Technologie</h3>
              <p style={{ margin: 0 }}>Geavanceerde apparatuur voor nauwkeurige en pijnloze behandelingen.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="glass-panel hover-card" style={{ padding: '2.5rem', height: '100%', background: 'var(--surface)' }}>
              <div style={{ background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <HeartHandshake size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Persoonlijke Zorg & Comfort</h3>
              <p style={{ margin: 0 }}>Behandelingen op maat in een vriendelijke, stressvrije tandartsbeleving.</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* About Section */}
      <section id="over-ons" className="section container">
        <div className="grid-2" style={{ alignItems: 'center', gap: '5rem', padding: '4rem 0' }}>
          <FadeInUp delay={0.2}>
            <div className="image-wrapper" style={{ height: '550px' }}>
              <Image
                src="/images/about.png"
                alt="Team Tandartspraktijk Stralend"
                width={800}
                height={600}
                className="about-image"
                style={{ height: '100%' }}
              />
            </div>
          </FadeInUp>
          <div>
            <FadeInUp delay={0.1}>
              <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>Uw Vertrouwde Partner voor een <span className="text-gradient">Gezonde Glimlach!</span></h2>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                Bij Tandartspraktijk Stralend streven we ernaar om uitmuntende tandheelkundige zorg te bieden, met een focus op comfort, precisie en patiënttevredenheid. Ons ervaren team van tandartsen en mondhygiënisten zorgt ervoor dat elk bezoek een positieve en stressvrije ervaring is.
              </p>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <h3 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Wat maakt ons uniek?</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '1.125rem', fontWeight: 500, color: 'var(--secondary)' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                  <strong>Ervaren Professionals</strong> – Jarenlange expertise in moderne tandheelkunde.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '1.125rem', fontWeight: 500, color: 'var(--secondary)' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                  <strong>Persoonlijke Zorg</strong> – Behandelingen op maat voor uw unieke gebitsbehoeften.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '1.125rem', fontWeight: 500, color: 'var(--secondary)' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                  <strong>Vriendelijke Omgeving</strong> – Een warme, gastvrije en stressvrije sfeer.
                </li>
              </ul>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section container" style={{ padding: '6rem 1.5rem' }}>
        <FadeInUp>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem' }}>Hoe Werkt Onze Tandartsafspraak?</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>Een afspraak maken bij Tandartspraktijk Stralend is eenvoudig en stressvrij. Volg deze stappen om de beste tandheelkundige zorg te krijgen!</p>
          </div>
        </FadeInUp>

        <StaggerContainer className="grid-3" style={{ gap: '2rem' }}>
          <StaggerItem>
            <div className="glass-panel text-center" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Schrijf je in</h3>
              <p style={{ textAlign: 'center', margin: 0 }}>Meld je online aan of neem telefonisch contact met ons op.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="glass-panel text-center" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Bevestiging</h3>
              <p style={{ textAlign: 'center', margin: 0 }}>Ontvang een bevestiging via e-mail of telefoon.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="glass-panel text-center" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Bezoek & Behandeling</h3>
              <p style={{ textAlign: 'center', margin: 0 }}>Kom naar onze praktijk en krijg deskundige zorg op maat.</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Facilities / Gallery Section */}
      <section id="faciliteiten" className="section container" style={{ padding: '6rem 1.5rem' }}>
        <FadeInUp>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem' }}>Een kijkje in onze <span className="text-gradient">Kliniek</span></h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>Modern, steriel en ontworpen voor uw comfort.</p>
          </div>
        </FadeInUp>

        <StaggerContainer className="grid-3" style={{ gap: '1.5rem' }}>
          <StaggerItem className="image-wrapper" style={{ height: '350px' }}>
            <Image src="/images/reception.png" alt="Receptie" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-card" />
          </StaggerItem>
          <StaggerItem className="image-wrapper" style={{ height: '350px' }}>
            <Image src="/images/tech.png" alt="Apparatuur" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-card" />
          </StaggerItem>
          <StaggerItem className="image-wrapper" style={{ height: '350px' }}>
            <Image src="/images/happy.png" alt="Blije patiënt" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-card" />
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Services Section */}
      <section id="diensten" className="section container" style={{ padding: '2rem 1.5rem' }}>
        <FadeInUp>
          <div className="glass-panel" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '5rem 3rem', margin: '0 auto', boxShadow: 'var(--shadow-xl)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '3rem' }}>Onze Behandelingen</h2>
              <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.125rem' }}>Bij Tandartspraktijk Stralend streven we ernaar om hoogwaardige behandelingen en uitstekende resultaten te bieden. Ons team bestaat uit ervaren professionals die uw behandelingen op maat afstemmen op uw individuele behoeften.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                "Wortelkanaalbehandeling",
                "Kronen & Bruggen",
                "Periodieke controle",
                "Implantaten",
                "Kunstgebit & Prothese",
                "Kindertandarts",
                "Mondhygiënist",
                "Cariës & Vullingen"
              ].map((service, index) => (
                <div key={index} className="glass-panel hover-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ color: 'var(--primary)' }}><CheckCircle size={24} /></div>
                  <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--secondary)' }}>{service}</span>
                </div>
              ))}
            </div>

            <FadeInUp delay={0.4}>
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Link href="/boeken" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.25rem', boxShadow: '0 10px 25px rgba(14,165,233,0.3)' }}>INSCHRIJVEN</Link>
              </div>
            </FadeInUp>
          </div>
        </FadeInUp>
      </section>

      {/* FAQ Section */}
      {/* Removed as per instructions */}

      {/* Call to Action Footer block */}
      <section className="section container">
        <FadeInUp>
          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #1e293b 100%)', color: 'white', padding: '5rem 3rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: 'none' }}>
            <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '1.5rem' }}>Word lid van onze tandheelkundige familie</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>Ervaar deskundige zorg in een warme, vriendelijke omgeving. Schrijf je nu in voor topkwaliteit tandheelkundige behandelingen!</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link href="/boeken" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.25rem', background: 'white', color: 'var(--secondary)' }}>INSCHRIJVEN</Link>
              <a href="tel:0201234567" className="btn btn-secondary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.25rem', background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Bel Ons Nu</a>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ background: 'var(--surface)', borderTop: '1px solid var(--surface-border)', padding: '5rem 0 2rem 0', marginTop: '2rem' }}>
        <div className="container grid-3" style={{ marginBottom: '4rem', gap: '4rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.05em', marginBottom: '1.5rem' }}>Tandartspraktijk Stralend</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Uw vertrouwde tandartspraktijk in Rotterdam. Wij streven naar de hoogste kwaliteit in mondzorg met een persoonlijke en zachte aanpak.</p>
            <Link href="/boeken" className="btn btn-primary">Schrijf je in</Link>
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Contactgegevens</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <MapPin className="text-primary" size={20} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                <span>Tandartsstraat 1<br />1234 AB, Amsterdam</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Phone className="text-primary" size={20} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                <span>020 123 4567</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail className="text-primary" size={20} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                <span>info@tandartspraktijkstralend.nl</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Openingstijden</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Maandag - Vrijdag:</span> <span style={{ fontWeight: 500, color: 'var(--secondary)' }}>09:00 - 17:00</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Zaterdag:</span> <span style={{ fontWeight: 500 }}>Gesloten</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Zondag:</span> <span style={{ fontWeight: 500 }}>Gesloten</span></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>&copy; 2023 Tandartspraktijk Stralend | Developed by Top Tier Devs</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy" className="hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>Privacybeleid</Link>
            <Link href="/admin" className="hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>Medewerkers Portaal</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import Lightfall from '../components/Lightfall';
import CardNav from '../components/CardNav';

// Navigation items
const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    dropdown: [
      { label: 'The Device', href: '#device' },
      { label: 'Our Mission', href: '#mission' },
    ],
  },
  {
    label: 'Features',
    dropdown: [
      { label: 'Smart Headband', href: '#features' },
      { label: 'Guided Care Device', href: '#features' },
      { label: 'Transport Alert System', href: '#features' },
    ],
  },
  {
    label: 'Dashboard',
    dropdown: [
      { label: 'Patient Login', href: '/login?role=patient' },
      { label: 'Doctor Login', href: '/login?role=doctor' },
    ],
  },
  {
    label: 'Contact',
    dropdown: [
      { label: 'Email', href: 'mailto:contact@smarttbi.com' },
      { label: 'LinkedIn', href: 'https://linkedin.com' },
      { label: 'GitHub', href: 'https://github.com' },
    ],
  },
];

// Feature cards data
const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Detection', desc: 'Real-time TBI pattern recognition using sensor fusion and threshold algorithms.', color: 'text-blue-400' },
  { icon: '🚨', title: 'Instant Emergency Alerts', desc: 'Sub-2-second emergency notifications to medical teams via real-time socket events.', color: 'text-danger' },
  { icon: '💡', title: 'LED Status System', desc: 'SEAML / CAUTION / DANGER visual indicators with dynamic condition-based color changes.', color: 'text-accent' },
  { icon: '📍', title: 'GPS Location Tracking', desc: 'Precise patient GPS coordinates sent with every alert for rapid emergency dispatch.', color: 'text-success' },
  { icon: '👨‍⚕️', title: 'Doctor Dashboard', desc: 'Professional medical interface with severity-sorted alerts and preparation checklists.', color: 'text-purple-400' },
  { icon: '📊', title: 'Vitals History', desc: 'Continuous logging of heart rate, oxygen, pressure, and movement with visual charts.', color: 'text-cyan-400' },
  { icon: '📡', title: 'Real-Time Sync', desc: 'Socket.io powered live updates — both patient and doctor dashboards sync instantly.', color: 'text-green-400' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, role-based access, and encrypted data storage for full compliance.', color: 'text-orange-400' },
];

const DEVICE_SPECS = [
  { icon: '💓', label: 'Heart Rate Monitor', desc: 'Continuous BPM via optical sensor' },
  { icon: '🪷', label: 'Oxygen (SpO2) Sensor', desc: 'Pulse oximetry monitoring' },
  { icon: '🔋', label: 'Pressure Sensor', desc: 'Intracranial pressure detection' },
  { icon: '📡', label: 'Movement Detector', desc: '3-axis accelerometer for motion alerts' },
  { icon: '💡', label: 'RGB LED Indicator', desc: 'Green / Yellow / Red status display' },
  { icon: '📍', label: 'GPS Module', desc: 'Real-time location broadcasting' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🎯', title: 'Wear Device', desc: 'Patient wears the smart headband with integrated sensors' },
  { step: '02', icon: '📡', title: 'Monitor Vitals', desc: 'Device streams heart rate, oxygen, pressure, and movement data' },
  { step: '03', icon: '🔍', title: 'Detect Anomalies', desc: 'System analyzes patterns and calculates LED status in real-time' },
  { step: '04', icon: '📲', title: 'Alert Doctors', desc: 'Instant Socket.io notification with GPS location to medical team' },
  { step: '05', icon: '🏥', title: 'Prepared Response', desc: 'Doctor receives checklist and prepares the right equipment in advance' },
];

// Main Landing Component
export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0A29FF' }}>
      {/* Lightfall animated canvas background - covers full viewport */}
      <div className="fixed inset-0 z-0">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      {/* Sticky navigation - Changed theme to "dark" for better visibility on the dark background */}
    {/* Sticky navigation */}
<CardNav
  logo="⚡ TBI KIT"
  logoAlt="SMART TBI Survival Kit"
  items={NAV_ITEMS}
  baseColor="#fff"
  menuColor="#000"
  buttonBgColor="#111"
  buttonTextColor="#fff"
  ease="power3.out"
  theme="dark"  
/>

      {/* All page content renders on top of the canvas */}
      <div className="relative z-10">

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center max-w-4xl mx-auto">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30 text-success text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Monitoring System Active
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight">
              SMART TBI
              <span className="block text-accent drop-shadow-lg" style={{ textShadow: '0 0 40px rgba(245,183,0,0.4)' }}>
                SURVIVAL KIT
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 mb-6">
              Early Detection. Guided Care.{' '}
              <span className="text-accent font-semibold">Faster Saves Lives.</span>
            </p>

            <p className="text-white/55 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              Revolutionary wearable TBI monitoring technology combining IoT sensors, real-time
              analytics, and emergency response protocols to protect patients when every second counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all duration-200 shadow-lg text-lg"
                style={{ boxShadow: '0 8px 30px rgba(245,183,0,0.3)' }}
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 text-lg"
              >
                Sign In →
              </Link>
            </div>

            {/* Hero stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {[{ value: '<2s', label: 'Alert Time' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Monitoring' }].map(
                ({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-black text-accent">{value}</div>
                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Capabilities</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Advanced Features</h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Comprehensive TBI monitoring powered by cutting-edge IoT and real-time communication technology
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map(({ icon, title, desc, color }) => (
                <div
                  key={title}
                  className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'rgba(10,14,35,0.6)', backdropFilter: 'blur(12px)' }}
                >
                  <div className={`text-3xl mb-4 ${color}`}>{icon}</div>
                  <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Device Overview Section */}
        <section id="device" className="py-28 px-4" style={{ background: 'rgba(11,18,32,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">Hardware</span>
                <h2 className="text-4xl font-bold text-white mt-2 mb-6">Smart TBI Headband</h2>
                <p className="text-white/65 mb-8 text-lg leading-relaxed">
                  A wearable device worn by the patient that continuously monitors vital signs. When
                  abnormal readings are detected, the LED changes color and an emergency alert fires
                  instantly to the assigned medical team.
                </p>
                <div className="space-y-3">
                  {DEVICE_SPECS.map(({ icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{label}</div>
                        <div className="text-white/45 text-xs">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device visual */}
              <div className="flex justify-center">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-4 rounded-full border border-blue-500/20" />
                  <div className="absolute inset-8 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className="w-36 h-36 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(245,183,0,0.15), rgba(82,39,255,0.15))', border: '1px solid rgba(245,183,0,0.3)' }}
                    >
                      <span className="text-6xl">🎯</span>
                    </div>
                    <div className="mt-5 text-center">
                      <div className="text-accent font-bold text-sm">TBI-DEVICE-001</div>
                      <div className="flex items-center gap-1.5 justify-center mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-success text-sm font-semibold">SEAML</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="mission" className="py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Workflow</span>
              <h2 className="text-4xl font-bold text-white mt-3 mb-4">How It Works</h2>
              <p className="text-white/60">From patient detection to emergency response in under 2 seconds</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {HOW_IT_WORKS.map(({ step, icon, title, desc }, idx) => (
                <div key={step} className="relative text-center px-2">
                  <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <div className="text-accent font-bold text-xs mb-1 tracking-wider">{step}</div>
                  <div className="text-white font-semibold text-sm mb-1">{title}</div>
                  <div className="text-white/50 text-xs leading-relaxed">{desc}</div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute top-8 left-[65%] w-[70%] h-px bg-gradient-to-r from-accent/30 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Workflow Section */}
        <section className="py-28 px-4" style={{ background: 'rgba(11,18,32,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Response Protocol</span>
              <h2 className="text-4xl font-bold text-white mt-3 mb-4">Emergency Workflow</h2>
              <p className="text-white/60">Three-tier alert system for graduated emergency response</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* SEAML */}
              <div className="border border-success/30 rounded-2xl p-6" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 rounded-full bg-success shadow-lg" style={{ boxShadow: '0 0 12px rgba(34,197,94,0.6)' }} />
                  <h3 className="text-success font-black text-xl tracking-wider">SEAML</h3>
                </div>
                <p className="text-white/65 text-sm mb-5">Patient is stable. All vital signs within normal thresholds.</p>
                <ul className="space-y-2 text-sm text-white/55">
                  <li>✅ Oxygen &gt; 95%</li>
                  <li>✅ Heart Rate 60–100 BPM</li>
                  <li>✅ No concerning symptoms</li>
                </ul>
                <div className="mt-5 p-3 rounded-xl border border-success/20" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <div className="text-success font-semibold text-sm">Action: Routine Monitoring</div>
                  <div className="text-white/40 text-xs mt-1">Checklist: Prepare examination room</div>
                </div>
              </div>

              {/* CAUTION */}
              <div className="border border-warning/30 rounded-2xl p-6" style={{ background: 'rgba(234,179,8,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 rounded-full bg-warning led-caution" style={{ boxShadow: '0 0 12px rgba(234,179,8,0.6)' }} />
                  <h3 className="text-warning font-black text-xl tracking-wider">CAUTION</h3>
                </div>
                <p className="text-white/65 text-sm mb-5">Warning signs detected. Medical evaluation urgently needed.</p>
                <ul className="space-y-2 text-sm text-white/55">
                  <li>⚡ Oxygen 90–95%</li>
                  <li>⚡ Heart Rate 100–120 BPM</li>
                  <li>⚡ Headache or dizziness reported</li>
                </ul>
                <div className="mt-5 p-3 rounded-xl border border-warning/20" style={{ background: 'rgba(234,179,8,0.08)' }}>
                  <div className="text-warning font-semibold text-sm">Action: Urgent Evaluation</div>
                  <div className="text-white/40 text-xs mt-1">Checklist: Oxygen support, Trauma bed</div>
                </div>
              </div>

              {/* DANGER */}
              <div className="border border-danger/30 rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 rounded-full bg-danger led-danger" style={{ boxShadow: '0 0 12px rgba(239,68,68,0.7)' }} />
                  <h3 className="text-danger font-black text-xl tracking-wider">DANGER</h3>
                </div>
                <p className="text-white/65 text-sm mb-5">Critical condition. Immediate emergency response required NOW.</p>
                <ul className="space-y-2 text-sm text-white/55">
                  <li>🚨 Oxygen &lt; 90%</li>
                  <li>🚨 Confusion or unconscious</li>
                  <li>🚨 Abnormal movement detected</li>
                </ul>
                <div className="mt-5 p-3 rounded-xl border border-danger/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <div className="text-danger font-semibold text-sm">Action: Emergency Response</div>
                  <div className="text-white/40 text-xs mt-1">Checklist: CT scanner, Neurosurgeon, Trauma team</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="py-28 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Join Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-6">Ready to Save Lives?</h2>
            <p className="text-white/60 mb-10 text-lg leading-relaxed">
              Join the Smart TBI Survival Kit network today. Register as a patient to monitor your
              vitals, or as a doctor to manage emergency alerts and patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=patient"
                className="px-8 py-4 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg text-lg"
                style={{ boxShadow: '0 8px 30px rgba(245,183,0,0.3)' }}
              >
                Register as Patient
              </Link>
              <Link
                to="/register?role=doctor"
                className="px-8 py-4 font-bold rounded-xl hover:opacity-90 transition-all border text-lg"
                style={{ background: 'rgba(82,39,255,0.2)', color: '#A6C8FF', borderColor: 'rgba(82,39,255,0.4)' }}
              >
                Register as Doctor
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-14 px-4 border-t border-white/10" style={{ background: 'rgba(11,18,32,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="text-accent font-black text-2xl mb-4">⚡ TBI KIT</div>
                <p className="text-white/45 text-sm leading-relaxed">
                  Smart TBI Survival Kit — Advanced traumatic brain injury monitoring and emergency
                  response system.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-success text-xs font-medium">System Operational</span>
                </div>
              </div>

              {[
                { title: 'Product', links: ['Features', 'Device', 'How It Works', 'Emergency System'] },
                { title: 'Portal', links: ['Patient Dashboard', 'Doctor Dashboard', 'Register', 'Login'] },
                { title: 'Connect', links: ['Documentation', 'Contact Us', 'GitHub', 'LinkedIn'] },
              ].map(({ title, links }) => (
                <div key={title}>
                  <h4 className="text-white font-semibold mb-4">{title}</h4>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-white/45 hover:text-white/80 text-sm transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-white/35 text-sm">© 2025 Smart TBI Survival Kit. All rights reserved.</div>
              <div className="text-white/35 text-sm">
                Built for hackathon demonstration purposes
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
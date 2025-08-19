import { useState, useEffect } from "react";
import {
  MessageCircle,
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export default function ProfessionalChatLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentDevice((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const devices = [
    { icon: Smartphone, label: "Mobile" },
    { icon: Monitor, label: "Desktop" },
    { icon: Tablet, label: "Tablet" },
  ];

  const features = [
    { icon: Shield, title: "Secure", description: "End-to-end encryption" },
    { icon: Zap, title: "Fast", description: "Low latency" },
    { icon: Globe, title: "Scalable", description: "High availability" },
  ];

  return (
    <div className="min-h-screen w-screen  bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Professional background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.02)_50%,transparent_75%)]"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full bg-[linear-gradient(rgba(16,185,129,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-8 py-6">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center">
                <MessageCircle
                  size={20}
                  className="text-white"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Collaborato
              </span>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8">
          <div
            className={`text-center max-w-6xl mx-auto transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Hero Icon */}
            <div className="mb-12 relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl shadow-xl relative">
                <MessageCircle
                  size={40}
                  className="text-white"
                  strokeWidth={1.5}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl"></div>
              </div>
            </div>

            {/* Professional Headlines */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                MidLineX
                <span className="block text-emerald-600 mt-2">
                  Messaging platform
                </span>
              </h1>
              <div className="w-20 h-0.5 bg-gradient-to-r from-emerald-600 to-green-500 mx-auto"></div>
            </div>

            {/* Value Proposition */}
            <p className="text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Build scalable applications with our microservice communication
              platform.
            </p>

            {/* Device Showcase */}
            <div className="flex justify-center items-center space-x-16 mb-16">
              {devices.map((device, index) => {
                const IconComponent = device.icon;
                const isActive = index === currentDevice;
                return (
                  <div
                    key={index}
                    className={`transform transition-all duration-700 ${
                      isActive ? "scale-110" : "scale-100 opacity-60"
                    }`}
                  >
                    <div
                      className={`relative w-16 h-16 rounded-xl transition-all duration-500 flex items-center justify-center ${
                        isActive
                          ? "bg-emerald-600 shadow-lg shadow-emerald-200/50"
                          : "bg-white shadow-md border border-slate-200/50"
                      }`}
                    >
                      <IconComponent
                        size={28}
                        className={`transition-colors duration-300 ${
                          isActive ? "text-white" : "text-emerald-600"
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <p
                      className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                        isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {device.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Feature Pills */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50"
                  >
                    <IconComponent
                      size={16}
                      className="text-emerald-600"
                      strokeWidth={2}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              Microservice communication platform for modern applications
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

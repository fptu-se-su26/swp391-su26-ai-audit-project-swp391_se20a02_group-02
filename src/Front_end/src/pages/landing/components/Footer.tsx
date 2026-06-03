import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Globe, Facebook, Instagram, Twitter, Youtube
} from 'lucide-react';
import logoImage from '@/image/logo.png';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const links = {
    Explore: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Top Destinations', href: '/marketplace' },
      { label: 'Compare Vehicles', href: '/compare' },
    ],
    Owners: [
      { label: 'List Your Vehicle', href: '/owner' },
      { label: 'Owner Dashboard', href: '/owner/dashboard' },
      { label: 'Earnings Calculator', href: '/#become-owner' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Trust & Safety', href: '/help' },
      { label: 'Contact Us', href: '/help/contact' },
      { label: 'Insurance Info', href: '/help' },
    ],
    Legal: [
      { label: 'About LuxeWay', href: '/about' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-[#0F172A] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="LuxeWay" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Vietnam's premier peer-to-peer vehicle rental marketplace. Cars, motorbikes, and more — verified, insured, and delivered.
            </p>
            {/* Newsletter */}
            <p className="text-white text-xs font-bold uppercase tracking-wide mb-3">Stay Updated</p>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400/50 transition-colors" />
              <button className="px-4 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-bold hover:bg-amber-300 transition-colors">Go</button>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href + Icon.name} href={href}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-amber-400/20 transition-colors">
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-slate-400 text-sm hover:text-amber-400 transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="py-6 border-t border-white/10 border-b grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: '+84 1800 LuxeWay', sub: 'Mon–Sun 6am–11pm' },
            { icon: Mail, label: 'support@luxeway.vn', sub: 'Average response: <1hr' },
            { icon: MapPin, label: '123 Nguyen Hue, Ho Chi Minh City', sub: 'Headquarters' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-xs font-medium">{label}</p>
                <p className="text-slate-500 text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 LuxeWay International. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Vietnam</span>
            <span>·</span>
            <span>USD / VND</span>
            <span>·</span>
            <span>Tiếng Việt / English</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

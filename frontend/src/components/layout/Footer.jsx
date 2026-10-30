import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-luxe-dark text-luxe-cream mt-24">
      <div className="container-luxe py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-display text-luxe-gold mb-4">Luxe Spa</h3>
          <p className="text-sm text-luxe-cream/70 leading-relaxed">
            An oasis of calm in the heart of the city. Premium therapies, expert therapists,
            and a service experience designed around you.
          </p>
          <div className="flex gap-4 mt-5 text-lg">
            <FiFacebook /> <FiInstagram /> <FiTwitter /> <FiYoutube />
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-luxe-cream/70">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/therapists">Our Therapists</Link></li>
            <li><Link to="/membership">Membership</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-luxe-cream/70">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Get In Touch</h4>
          <ul className="space-y-3 text-sm text-luxe-cream/70">
            <li className="flex items-center gap-2"><FiMapPin /> 123 Wellness Ave, Lucknow, India</li>
            <li className="flex items-center gap-2"><FiPhone /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><FiMail /> hello@luxespa.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-luxe-cream/50">
        © {new Date().getFullYear()} Luxe Spa & Wellness. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

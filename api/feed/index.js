const { getCollection } = require('../lib/db');
const { corsHeaders } = require('../lib/auth');

const defaultFeed = [
  { title: "Use Strong, Unique Passwords", category: "Tips", content: "Create passwords with at least 12 characters mixing letters, numbers, and symbols. Use a password manager.", date: "2024-01-15" },
  { title: "Beware of Phishing Emails", category: "Awareness", content: "Check sender addresses carefully. Hover over links before clicking. When in doubt, contact the sender directly.", date: "2024-01-20" },
  { title: "Enable Two-Factor Authentication", category: "Tips", content: "Add an extra security layer. Even if your password is compromised, attackers can't access your account.", date: "2024-02-01" },
  { title: "Ransomware Attacks Surge", category: "News", content: "New ransomware variants target businesses worldwide. Backup your data regularly and offline.", date: "2024-02-10" },
  { title: "Update Software Regularly", category: "Tips", content: "Keep your OS, browsers, and apps updated. Updates patch critical security vulnerabilities.", date: "2024-02-15" },
  { title: "Public Wi-Fi Risks", category: "Awareness", content: "Avoid sensitive transactions on public networks. Use a VPN for added security.", date: "2024-02-20" },
  { title: "Social Engineering Tactics", category: "Awareness", content: "Attackers manipulate you through trust. Verify requests through official channels.", date: "2024-03-01" },
  { title: "New Malware Strain Detected", category: "News", content: "Security researchers discovered new info-stealer targeting financial apps. Stay vigilant.", date: "2024-03-10" },
  { title: "Secure Your Home Network", category: "Tips", content: "Change default router passwords, use WPA3 encryption, and keep firmware updated.", date: "2024-03-15" },
  { title: "Data Privacy Matters", category: "Awareness", content: "Limit personal info shared online. Review privacy settings on social media.", date: "2024-03-20" }
];

module.exports = async function handler(req, res) {
  const headers = corsHeaders();
  
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader(headers).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).setHeader(headers).json({ error: 'Method not allowed' });
  }
  
  try {
    const category = req.query.category;
    let feed = defaultFeed;
    
    if (category && category !== 'All') {
      feed = feed.filter(item => item.category === category);
    }
    
    return res.status(200).setHeader(headers).json({ feed });
  } catch (error) {
    return res.status(200).setHeader(headers).json({ feed: defaultFeed });
  }
};
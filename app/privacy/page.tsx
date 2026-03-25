import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-violet-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-kid">
        <h1 className="text-3xl font-black text-violet-900 mb-6 uppercase">Privacy Policy</h1>
        <p className="text-violet-600 mb-4 font-bold">Last updated: March 25, 2026</p>
        
        <section className="space-y-4 text-violet-800 leading-relaxed">
          <p>This Privacy Policy describes how <strong>Family Tasks</strong> ("we", "our", or "the App") handles your personal information when you use our services.</p>
          
          <h2 className="text-xl font-black text-violet-700 mt-6 uppercase">1. Information We Collect</h2>
          <p>When you log in via Facebook or Google, we collect your name, email address, and profile picture to create your family profile. We do not sell or share this data with third parties.</p>
          
          <h2 className="text-xl font-black text-violet-700 mt-6 uppercase">2. Use of Data</h2>
          <p>Your data is used solely for identifying you within your family group and tracking task progress. We use Firebase (a Google service) to securely store this information.</p>
          
          <h2 className="text-xl font-black text-violet-700 mt-6 uppercase">3. Data Retention</h2>
          <p>We keep your data as long as your account is active. You can request data deletion at any time.</p>
          
          <div className="mt-10 p-6 bg-violet-50 rounded-2xl border-2 border-violet-100 italic">
            <p>This is a private, family-oriented application. We prioritize your family's privacy and security.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

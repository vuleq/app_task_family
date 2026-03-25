import React from 'react'

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-violet-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-kid text-center">
        <h1 className="text-3xl font-black text-violet-900 mb-6 uppercase">Data Deletion Instructions</h1>
        
        <section className="space-y-6 text-violet-800 leading-relaxed">
          <p>At <strong>Family Tasks</strong>, we respect your right to control your data. If you wish to delete your account and all associated data, please follow the steps below:</p>
          
          <div className="bg-violet-50 p-6 rounded-2xl border-2 border-violet-100 text-left">
            <ol className="list-decimal list-inside space-y-3 font-bold">
              <li>Open the app and log in to your account.</li>
              <li>Go to your <strong>Profile Settings</strong>.</li>
              <li>Click on the <strong>"Delete Account"</strong> button (if available) or contact the Family Admin.</li>
              <li>Alternatively, you can send an email to the administrator to request manual deletion.</li>
            </ol>
          </div>
          
          <p className="mt-6">Once requested, all your personal data (name, email, tasks, and XP) will be permanently removed from our Firebase database within 48 hours.</p>
        </section>
      </div>
    </div>
  )
}

import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <p className="text-sm text-foreground/80">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Overview</h2>
        <p>
          We only collect the minimum information necessary to provide this app: authentication via Discord and the combos you choose to create or save.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Authentication data</span>: When you sign in with Discord, we receive basic account details (such as your Discord user ID, username, and avatar) to identify your account.
          </li>
          <li>
            <span className="font-medium">Combos you store</span>: Combos you create, edit, or save are stored so they can be shown to you and shared with others as intended by the app.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To authenticate you and keep you signed in.</li>
          <li>To associate combos with your account and enable sharing features.</li>
          <li>To maintain the basic functionality and security of the service.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What We Don’t Do</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>No selling of personal data.</li>
          <li>No advertising or tracking cookies beyond what’s necessary for auth and basic analytics (if enabled).</li>
          <li>No unnecessary data collection outside of authentication and combo storage.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Sharing</h2>
        <p>
          We do not share your personal information with third parties except as required to provide authentication (e.g., Discord) or to comply with the law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Retention</h2>
        <p>
          We retain your account information and saved combos for as long as your account exists. You can request deletion of your account and associated combos at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Rights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the data we have about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Contact us for any privacy questions or requests.</li>
        </ul>
        <p>
          To make a request, email <a className="text-blue-400 font-medium" href="mailto:2XKOMBO@gmail.com">2XKOMBO@gmail.com</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          If you have questions about this policy, email <a className="text-blue-400 font-medium" href="mailto:2XKOMBO@gmail.com">2XKOMBO@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}



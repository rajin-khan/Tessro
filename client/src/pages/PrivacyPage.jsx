import PageLayout from '../components/Layout/PageLayout';

export default function PrivacyPage() {
    return (
        <PageLayout title="Privacy Policy" description="What Fliccs keeps, what it never keeps, and how your sessions remain private.">
            <div className="policy-content">
                <div className="policy-intro">
                    <p className="policy-kicker">Last updated: September 2026</p>
                    <p className="policy-lead">
                        Your privacy is non-negotiable. Fliccs is built to be ephemeral, meaning we don't store what you don't ask us to.
                    </p>
                </div>

                <section>
                    <h2>
                        <span>01.</span> Data Collection
                    </h2>
                    <p>
                        We may collect browser-level page views and basic product events, such as room creation, joining, and technical failures. These events do not include room IDs, invite links, passwords, nicknames, chat text, or video content. Premium accounts also require the details needed for authentication and payment.
                    </p>
                </section>

                <section>
                    <h2>
                        <span>02.</span> Use of Data
                    </h2>
                    <p>
                        We use product events to understand where people get stuck and to improve reliability. PostHog processes these events for us in its US Cloud region. We do not sell your data to third parties.
                    </p>
                </section>

                <section>
                    <h2>
                        <span>03.</span> Session Ephemerality
                    </h2>
                    <p>
                        Fliccs sessions are designed to be ephemeral. We do not persistently store chat logs, file metadata, or stream contents after a session has ended. Once a room is destroyed, the data is gone.
                    </p>
                    <p>We never make session recordings of the watch room or its entry forms.</p>
                </section>

                <section>
                    <h2>
                        <span>04.</span> Cookies & Storage
                    </h2>
                    <p>
                        We use essential local storage to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.
                    </p>
                </section>
            </div>
        </PageLayout>
    );
}

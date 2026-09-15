-- LexiGuard AI Demo Seed Data
-- Run this in Supabase SQL Editor after applying 001_initial_schema.sql
-- Uses fixed UUIDs for reproducible demo data

-- ============================================================
-- DEMO USER (replace with your actual Supabase Auth user ID)
-- ============================================================
-- After signing up, replace this UUID with your user's ID:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';
DO $$
DECLARE
  demo_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  svc_v1_id uuid := '11111111-1111-1111-1111-111111111111';
  svc_v2_id uuid := '22222222-2222-2222-2222-222222222222';
  nda_id    uuid := '33333333-3333-3333-3333-333333333333';
  emp_id    uuid := '44444444-4444-4444-4444-444444444444';
  saas_id   uuid := '55555555-5555-5555-5555-555555555555';
  lease_id  uuid := '66666666-6666-6666-6666-666666666666';

  analysis_svc uuid := 'aaaa1111-1111-1111-1111-111111111111';
  analysis_nda uuid := 'aaaa2222-2222-2222-2222-222222222222';
  analysis_emp uuid := 'aaaa3333-3333-3333-3333-333333333333';
  analysis_saas uuid := 'aaaa4444-4444-4444-4444-444444444444';
  analysis_lease uuid := 'aaaa5555-5555-5555-5555-555555555555';

  comparison_id uuid := 'bbbb1111-1111-1111-1111-111111111111';
  chat_session uuid := 'cccc1111-1111-1111-1111-111111111111';
BEGIN

-- ============================================================
-- DOCUMENTS
-- ============================================================
INSERT INTO documents (id, user_id, filename, document_type, storage_path, file_size, page_count, status, created_at) VALUES
(svc_v1_id, demo_user_id, 'service_agreement_v1.txt', 'service_agreement', demo_user_id || '/svc_v1/service_agreement_v1.txt', 3200, 2, 'ready', now() - interval '14 days'),
(svc_v2_id, demo_user_id, 'service_agreement_v2.txt', 'service_agreement', demo_user_id || '/svc_v2/service_agreement_v2.txt', 3800, 2, 'ready', now() - interval '7 days'),
(nda_id,    demo_user_id, 'nda.txt', 'nda', demo_user_id || '/nda/nda.txt', 2400, 1, 'ready', now() - interval '10 days'),
(emp_id,    demo_user_id, 'employment_agreement.txt', 'employment', demo_user_id || '/emp/employment_agreement.txt', 4100, 3, 'ready', now() - interval '5 days'),
(saas_id,   demo_user_id, 'saas_subscription.txt', 'saas_subscription', demo_user_id || '/saas/saas_subscription.txt', 3500, 2, 'ready', now() - interval '3 days'),
(lease_id,  demo_user_id, 'commercial_lease.txt', 'commercial_lease', demo_user_id || '/lease/commercial_lease.txt', 3900, 2, 'ready', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DOCUMENT SECTIONS (key sections per document)
-- ============================================================
INSERT INTO document_sections (id, document_id, section_number, title, content, page_start, page_end, section_order) VALUES
-- Service Agreement v1
(gen_random_uuid(), svc_v1_id, '1', 'SCOPE OF SERVICES', 'Service Provider shall provide data analytics consulting, dashboard development, and ongoing technical support.', 1, 1, 1),
(gen_random_uuid(), svc_v1_id, '2', 'TERM AND TERMINATION', 'This Agreement shall commence on the Effective Date and continue for twelve (12) months. Either party may terminate upon thirty (30) days written notice. Client may terminate immediately for cause. Auto-renews for twelve (12) month periods unless sixty (60) days notice.', 1, 1, 2),
(gen_random_uuid(), svc_v1_id, '3', 'COMPENSATION', 'Monthly fee of $10,000. Payment due within fifteen (15) days. Late payments incur 1.5% per month penalty. All fees are non-refundable.', 1, 1, 3),
(gen_random_uuid(), svc_v1_id, '4', 'INDEMNIFICATION', 'Service Provider shall indemnify Client from any and all claims. Service Provider liable for all direct, indirect, incidental, special, consequential, and punitive damages.', 1, 1, 4),
(gen_random_uuid(), svc_v1_id, '5', 'INTELLECTUAL PROPERTY', 'All work product shall be sole and exclusive property of Client. Service Provider retains pre-existing IP.', 1, 1, 5),
(gen_random_uuid(), svc_v1_id, '7', 'LIMITATION OF LIABILITY', 'Total aggregate liability shall not exceed fees paid in twelve (12) months preceding the claim.', 1, 1, 6),

-- NDA
(gen_random_uuid(), nda_id, '2', 'CONFIDENTIAL INFORMATION', 'Includes business plans, financial data, customer lists, technical specifications, source code, algorithms, product roadmaps, and marketing strategies.', 1, 1, 1),
(gen_random_uuid(), nda_id, '3', 'OBLIGATIONS', 'Receiving Party shall hold in strict confidence, not disclose without consent, use solely for Purpose. Same degree of care as own confidential info, no less than reasonable care.', 1, 1, 2),
(gen_random_uuid(), nda_id, '5', 'TERM', 'Two (2) years from Effective Date. Confidential Information returned or destroyed upon termination.', 1, 1, 3),
(gen_random_uuid(), nda_id, '6', 'REMEDIES', 'Breach may cause irreparable harm. Injunctive relief available. Receiving Party liable for all damages.', 1, 1, 4),

-- Employment Agreement
(gen_random_uuid(), emp_id, '4', 'TERM AND TERMINATION', 'At-will employment. Either party may terminate with two (2) weeks notice. Employer may terminate immediately for cause. Severance: two (2) weeks per year of service.', 1, 2, 1),
(gen_random_uuid(), emp_id, '5', 'INTELLECTUAL PROPERTY', 'All inventions, code, designs created during employment are sole property of Employer. Employee assigns all rights including moral rights.', 2, 2, 2),
(gen_random_uuid(), emp_id, '6', 'NON-COMPETE', 'Eighteen (18) months post-termination. Cannot work for competitor, solicit employees/customers, disclose trade secrets. Applies worldwide.', 2, 3, 3),
(gen_random_uuid(), emp_id, '7', 'CONFIDENTIALITY', 'Strict confidentiality of all proprietary information. Obligations survive indefinitely.', 3, 3, 4),

-- SaaS Subscription
(gen_random_uuid(), saas_id, '2', 'SUBSCRIPTION TERM', 'Twelve (12) months. Auto-renews for twelve (12) month periods. Thirty (30) days notice for non-renewal. Early termination requires payment of all remaining fees.', 1, 1, 1),
(gen_random_uuid(), saas_id, '3', 'FEES AND PAYMENT', 'Annual fee $48,000 in monthly installments of $4,000. Fifteen (15) days to pay. 2.5% monthly late fee. Non-refundable. No credits for partial months. 10% annual increase.', 1, 1, 2),
(gen_random_uuid(), saas_id, '4', 'DATA AND PRIVACY', 'Customer retains data rights. Provider may access for Service. No selling data. Industry-standard security. 30-day data export after termination, then deletion.', 1, 1, 3),
(gen_random_uuid(), saas_id, '6', 'LIMITATION OF LIABILITY', 'No indirect, incidental, consequential, special, or punitive damages. Cap at 12 months fees. Not liable for data loss or breaches beyond control.', 1, 1, 4),

-- Commercial Lease
(gen_random_uuid(), lease_id, '3', 'RENT', 'Year 1: $8,500/month. 5% annual escalation. Due first of month. $250 late fee after 5th. 1.5% monthly interest on overdue.', 1, 1, 1),
(gen_random_uuid(), lease_id, '4', 'SECURITY DEPOSIT', 'Three months rent: $25,500. Refundable within 60 days, less deductions. Landlord may apply without notice.', 1, 1, 2),
(gen_random_uuid(), lease_id, '5', 'MAINTENANCE AND REPAIRS', 'Landlord: structural, roof, exterior. Tenant: interior, equipment, fixtures. Landlord entry with 24 hours notice.', 1, 1, 3),
(gen_random_uuid(), lease_id, '9', 'DEFAULT AND REMEDIES', 'Default: rent unpaid 5 days, covenant breached not cured 30 days. Remedies: termination, re-entry, damages, attorneys fees.', 1, 2, 4);

-- ============================================================
-- CLAUSES (extracted for vector search)
-- ============================================================
INSERT INTO clauses (id, document_id, section_number, title, content, page_number, clause_order) VALUES
-- Service Agreement v1
(gen_random_uuid(), svc_v1_id, '2.4', 'Auto-Renewal', 'This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.', 1, 10),
(gen_random_uuid(), svc_v1_id, '3.3', 'Late Payment Penalty', 'Late payments shall incur a penalty of 1.5% per month on the outstanding balance.', 1, 11),
(gen_random_uuid(), svc_v1_id, '3.4', 'Non-Refundable Fees', 'All fees are non-refundable.', 1, 12),
(gen_random_uuid(), svc_v1_id, '4.1', 'Broad Indemnification', 'Service Provider shall indemnify, defend, and hold harmless Client from any and all claims, damages, losses, costs, and expenses arising out of any breach by Service Provider.', 1, 13),
(gen_random_uuid(), svc_v1_id, '4.2', 'Uncapped Liability', 'Service Provider shall be liable for all direct, indirect, incidental, special, consequential, and punitive damages regardless of cause or theory of liability.', 1, 14),
(gen_random_uuid(), svc_v1_id, '5.1', 'IP Assignment', 'All work product, deliverables, and materials created by Service Provider shall be the sole and exclusive property of Client.', 1, 15),

-- NDA
(gen_random_uuid(), nda_id, '6.1', 'Injunctive Relief', 'Receiving Party acknowledges that any breach may cause irreparable harm for which monetary damages would be inadequate.', 1, 20),
(gen_random_uuid(), nda_id, '6.3', 'Full Damages Liability', 'Receiving Party shall be liable for all damages arising from any unauthorized disclosure.', 1, 21),

-- Employment Agreement
(gen_random_uuid(), emp_id, '6.1', 'Non-Compete Clause', 'For eighteen (18) months following termination, Employee shall not work for any direct competitor, solicit employees or customers, or disclose trade secrets. Applies worldwide.', 2, 30),
(gen_random_uuid(), emp_id, '5.1', 'Broad IP Assignment', 'All inventions, discoveries, code, designs, and intellectual property created during employment shall be sole property of Employer.', 2, 31),
(gen_random_uuid(), emp_id, '5.2', 'Moral Rights Assignment', 'Employee assigns all rights in Work Product to Employer, including moral rights.', 2, 32),
(gen_random_uuid(), emp_id, '4.2', 'Immediate Termination for Cause', 'Employer may terminate immediately for cause including misconduct, breach of policy, dishonesty, or poor performance as determined solely by Employer.', 1, 33),

-- SaaS Subscription
(gen_random_uuid(), saas_id, '2.2', 'Auto-Renewal', 'Agreement auto-renews for successive twelve (12) month periods unless Customer provides notice of non-renewal at least thirty (30) days prior.', 1, 40),
(gen_random_uuid(), saas_id, '2.3', 'Early Termination Penalty', 'Early termination by Customer requires payment of all remaining fees for the current term.', 1, 41),
(gen_random_uuid(), saas_id, '3.4', 'No Refunds', 'Fees are non-refundable. No credits for partial months.', 1, 42),
(gen_random_uuid(), saas_id, '3.5', 'Fee Increase', 'Provider may increase fees by up to 10% upon renewal with 60 days notice.', 1, 43),
(gen_random_uuid(), saas_id, '6.2', 'Liability Cap', 'Provider total liability shall not exceed fees paid in the twelve (12) months preceding the claim.', 1, 44),

-- Commercial Lease
(gen_random_uuid(), lease_id, '3.4', 'Late Fee', 'Late fee: $250 if rent not received by the 5th of the month.', 1, 50),
(gen_random_uuid(), lease_id, '3.5', 'Interest on Overdue', 'Additional 1.5% monthly interest on overdue amounts.', 1, 51),
(gen_random_uuid(), lease_id, '4.3', 'Deposit Application', 'Landlord may apply deposit to unpaid rent or damages without notice.', 1, 52),
(gen_random_uuid(), lease_id, '9.1', 'Default Triggers', 'Tenant in default if rent unpaid for five (5) days or any covenant breached and not cured within thirty (30) days.', 1, 53),
(gen_random_uuid(), lease_id, '9.2', 'Landlord Remedies', 'Upon default, Landlord may terminate, re-enter, recover damages, and pursue all remedies including attorneys fees.', 1, 54);

-- ============================================================
-- ANALYSES (5 documents analyzed with different roles/stances)
-- ============================================================
INSERT INTO analyses (id, document_id, user_id, role, negotiation_stance, overall_score, status, created_at, completed_at) VALUES
(analysis_svc,  svc_v1_id,  demo_user_id, 'Service Provider', 'Aggressive', 72, 'completed', now() - interval '13 days', now() - interval '13 days'),
(analysis_nda,  nda_id,     demo_user_id, 'General Party',    'Balanced',   45, 'completed', now() - interval '9 days',  now() - interval '9 days'),
(analysis_emp,  emp_id,     demo_user_id, 'Employee',         'Aggressive', 85, 'completed', now() - interval '4 days',  now() - interval '4 days'),
(analysis_saas, saas_id,    demo_user_id, 'Customer',         'Balanced',   58, 'completed', now() - interval '2 days',  now() - interval '2 days'),
(analysis_lease,lease_id,   demo_user_id, 'Tenant',           'Flexible',   63, 'completed', now() - interval '1 day',   now() - interval '1 day');

-- ============================================================
-- RISK FINDINGS (covers all severity levels and categories)
-- ============================================================
INSERT INTO risk_findings (analysis_id, document_id, category, severity, score, title, explanation, potential_impact, evidence, source_page) VALUES

-- === SERVICE AGREEMENT (analysis_svc) — 8 findings ===
-- CRITICAL
(analysis_svc, svc_v1_id, 'unlimited_liability', 'critical', 95,
 'Uncapped Consequential Damages',
 'Section 4.2 imposes unlimited liability for all direct, indirect, incidental, special, consequential, and punitive damages with no cap.',
 'Exposure to potentially unlimited financial liability for any claim, even minor breaches.',
 'Service Provider shall be liable for all direct, indirect, incidental, special, consequential, and punitive damages arising out of or relating to this Agreement, regardless of the cause of action or the theory of liability, even if Service Provider has been advised of the possibility of such damages.',
 1),

-- HIGH
(analysis_svc, svc_v1_id, 'unlimited_indemnification', 'high', 82,
 'Broad Indemnification Obligation',
 'Section 4.1 requires unlimited indemnification for any and all claims, with no carve-outs for negligence or gross negligence by Client.',
 'Financial exposure for claims that may not be within Service Provider control.',
 'Service Provider shall indemnify, defend, and hold harmless Client, its officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses arising out of or relating to any breach of this Agreement by Service Provider.',
 1),

-- HIGH
(analysis_svc, svc_v1_id, 'unfavorable_payment', 'high', 78,
 'Non-Refundable Fees',
 'Section 3.4 makes all fees non-refundable regardless of service quality or early termination.',
 'No recourse if services are unsatisfactory or contract terminates early.',
 'All fees are non-refundable.',
 1),

-- MEDIUM
(analysis_svc, svc_v1_id, 'auto_renewal', 'medium', 65,
 'Auto-Renewal with Narrow Cancellation Window',
 'Section 2.4 auto-renews for 12-month periods requiring 60-day advance notice. Missing the window locks in another full year.',
 'Unintended financial commitment if notice deadline is missed.',
 'This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.',
 1),

-- MEDIUM
(analysis_svc, svc_v1_id, 'excessive_penalties', 'medium', 58,
 'Late Payment Penalty',
 'Section 3.3 imposes 1.5% monthly penalty (18% annually) on late payments with only 15-day payment window.',
 'Significant financial penalty for minor payment delays.',
 'Late payments shall incur a penalty of 1.5% per month on the outstanding balance.',
 1),

-- LOW
(analysis_svc, svc_v1_id, 'missing_limitation', 'low', 42,
 'Liability Cap Only on One Side',
 'Section 7 caps Service Provider liability but Section 4.2 removes caps for consequential damages, creating inconsistency.',
 'Potential ambiguity in liability allocation.',
 'Service Providers total aggregate liability under this Agreement shall not exceed the fees paid by Client in the twelve (12) months preceding the claim.',
 1),

-- INFO
(analysis_svc, svc_v1_id, 'ip_ownership', 'info', 25,
 'Broad IP Assignment',
 'Section 5.1 assigns all work product as sole property of Client. Consider carve-outs for pre-existing IP and open-source components.',
 'Risk of losing rights to commonly used tools and methodologies.',
 'All work product, deliverables, and materials created by Service Provider in connection with the Services shall be the sole and exclusive property of Client.',
 1),

-- INFO
(analysis_svc, svc_v1_id, 'confidentiality', 'info', 20,
 'Short Confidentiality Period',
 'Section 6.2 limits confidentiality survival to 3 years. For proprietary data, consider extending.',
 'Confidential information may lose protection after 3 years.',
 'Confidentiality obligations shall survive termination of this Agreement for a period of three (3) years.',
 1),

-- === NDA (analysis_nda) — 5 findings ===
-- CRITICAL
(analysis_nda, nda_id, 'missing_limitation', 'critical', 88,
 'Unlimited Damages for Disclosure',
 'Section 6.3 imposes full damages liability for any unauthorized disclosure without any cap or limitation.',
 'Potentially catastrophic financial exposure for any breach.',
 'The Receiving Party shall be liable for all damages arising from any unauthorized disclosure.',
 1),

-- HIGH
(analysis_nda, nda_id, 'broad_liability', 'high', 75,
 'Injunctive Relief Exposure',
 'Section 6.1 acknowledges irreparable harm and allows injunctive relief, which could halt business operations.',
 'Operational disruption through court-ordered injunction.',
 'The Receiving Party acknowledges that any breach may cause irreparable harm for which monetary damages would be inadequate.',
 1),

-- MEDIUM
(analysis_nda, nda_id, 'restrictive_obligations', 'medium', 55,
 'Vague Confidential Information Definition',
 'Section 2.1 includes information that should reasonably be understood to be confidential, which is subjective and broad.',
 'Unintentional disclosure of information that turns out to be covered.',
 'Confidential Information means any information disclosed by either party that should reasonably be understood to be confidential given the nature of the information and circumstances of disclosure.',
 1),

-- LOW
(analysis_nda, nda_id, 'missing_protections', 'low', 38,
 'No Carve-Out for Legal Compulsion',
 'No exception for disclosures required by law, court order, or regulatory authority.',
 'Potential liability for legally compelled disclosures.',
 'The Receiving Party shall not disclose Confidential Information to any third party without prior written consent.',
 1),

-- INFO
(analysis_nda, nda_id, 'confidentiality', 'info', 22,
 'Reasonable Care Standard',
 'Section 3.2 requires reasonable care but not less than own confidential information, which may be lower for some organizations.',
 'Security posture may not match disclosing party expectations.',
 'The Receiving Party shall protect Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.',
 1),

-- === EMPLOYMENT AGREEMENT (analysis_emp) — 7 findings ===
-- CRITICAL
(analysis_emp, emp_id, 'non_compete', 'critical', 92,
 'Worldwide Non-Compete for 18 Months',
 'Section 6.1 imposes an 18-month worldwide non-compete covering any direct competitor. Extremely broad and potentially unenforceable in many jurisdictions.',
 'Complete career restriction for 18 months post-termination across entire industry globally.',
 'For a period of eighteen (18) months following termination, Employee shall not work for any direct competitor of Employer within the State of California.',
 2),

-- CRITICAL
(analysis_emp, emp_id, 'ip_ownership', 'critical', 90,
 'Total IP Assignment with Moral Rights',
 'Sections 5.1-5.2 assign ALL inventions and IP created during employment, including moral rights, with no carve-outs for personal projects.',
 'Employee loses all rights to any creative work, including side projects done on personal time.',
 'All inventions, discoveries, code, designs, and intellectual property created during employment shall be the sole and exclusive property of Employer. Employee assigns all rights including moral rights.',
 2),

-- HIGH
(analysis_emp, emp_id, 'unilateral_termination', 'high', 80,
 'Unilateral Termination for Cause',
 'Section 4.2 allows Employer to terminate immediately for poor performance as determined solely by Employer, with no appeal process.',
 'Job security is essentially non-existent; subjective performance judgment.',
 'Employer may terminate immediately for cause including misconduct, breach of policy, dishonesty, or poor performance as determined solely by Employer.',
 1),

-- HIGH
(analysis_emp, emp_id, 'restrictive_obligations', 'high', 76,
 'Broad Non-Solicitation',
 'Section 6.1 prohibits soliciting any employee or customer for 18 months, severely limiting professional networking.',
 'Cannot contact former colleagues or clients for nearly 2 years.',
 'Employee shall not solicit any employee or customer of Employer.',
 2),

-- MEDIUM
(analysis_emp, emp_id, 'unfavorable_payment', 'medium', 55,
 'Discretionary Bonus',
 'Section 3.3 states bonus is at Employer sole discretion, meaning no guaranteed compensation beyond base salary.',
 'Expected bonus income is not guaranteed.',
 'Annual performance bonus up to 20% of base salary, at Employers sole discretion.',
 1),

-- LOW
(analysis_emp, emp_id, 'missing_protections', 'low', 40,
 'Indefinite Confidentiality',
 'Section 7.2 makes confidentiality obligations survive indefinitely with no exceptions for information that becomes public.',
 'Potential liability for information that becomes public through no fault of Employee.',
 'Confidentiality obligations survive termination indefinitely.',
 3),

-- INFO
(analysis_emp, emp_id, 'confidentiality', 'info', 28,
 'Mandatory Arbitration',
 'Section 8.1 mandates binding arbitration for all disputes, waiving right to jury trial.',
 'Cannot pursue claims in court; arbitration may favor employer.',
 'All disputes shall be resolved through mandatory binding arbitration.',
 3),

-- === SAAS SUBSCRIPTION (analysis_saas) — 6 findings ===
-- CRITICAL
(analysis_saas, saas_id, 'auto_renewal', 'critical', 85,
 'Auto-Renewal with Early Termination Penalty',
 'Sections 2.2-2.3 auto-renew for 12 months and require payment of ALL remaining fees if Customer terminates early.',
 'Locked into paying full annual fee even if service is cancelled mid-term.',
 'Agreement auto-renews for successive twelve (12) month periods. Early termination by Customer requires payment of all remaining fees for the current term.',
 1),

-- HIGH
(analysis_saas, saas_id, 'unfavorable_payment', 'high', 77,
 'No Refunds or Credits',
 'Section 3.4 explicitly states fees are non-refundable with no credits for partial months.',
 'No financial recourse for service outages or dissatisfaction.',
 'Fees are non-refundable. No credits for partial months.',
 1),

-- HIGH
(analysis_saas, saas_id, 'excessive_penalties', 'high', 72,
 'High Late Payment Penalty',
 'Section 3.3 imposes 2.5% monthly interest (30% annually) on late payments.',
 'Penalty rate significantly exceeds standard market rates.',
 'Late payments accrue interest at 2.5% per month.',
 1),

-- MEDIUM
(analysis_saas, saas_id, 'auto_renewal', 'medium', 60,
 'Short Notice Period for Non-Renewal',
 'Section 2.2 requires only 30 days notice before auto-renewal, easy to miss.',
 'Unintended renewal if notice deadline is missed.',
 'Customer provides notice of non-renewal at least thirty (30) days prior to end of current term.',
 1),

-- MEDIUM
(analysis_saas, saas_id, 'unfavorable_payment', 'medium', 55,
 'Unilateral Fee Increase',
 'Section 3.5 allows Provider to increase fees by up to 10% upon renewal with only 60 days notice.',
 'Cost can increase significantly at each renewal without negotiation.',
 'Provider may increase fees by up to 10% upon renewal with 60 days notice.',
 1),

-- LOW
(analysis_saas, saas_id, 'missing_protections', 'low', 40,
 'Limited Data Export Window',
 'Section 4.5 provides only 30 days to export data after termination, then permanent deletion.',
 'Risk of data loss if export is not completed quickly.',
 'Provider shall make data available for export for thirty (30) days, then delete all data.',
 1),

-- === COMMERCIAL LEASE (analysis_lease) — 6 findings ===
-- HIGH
(analysis_lease, lease_id, 'unfavorable_payment', 'high', 79,
 'High Late Fees and Interest',
 'Sections 3.4-3.5 impose $250 flat late fee plus 1.5% monthly interest (18% annually) with only 5-day grace period.',
 'Significant cost for minor payment delays.',
 'Late fee: $250 if rent not received by the 5th. Additional 1.5% monthly interest on overdue amounts.',
 1),

-- HIGH
(analysis_lease, lease_id, 'missing_protections', 'high', 74,
 'Deposit Application Without Notice',
 'Section 4.3 allows Landlord to apply security deposit to unpaid rent or damages without any notice to Tenant.',
 'No opportunity to cure before deposit is used.',
 'Landlord may apply deposit to unpaid rent or damages without notice.',
 1),

-- MEDIUM
(analysis_lease, lease_id, 'unilateral_termination', 'medium', 62,
 'Broad Default Definition',
 'Section 9.1 defines default as rent unpaid for 5 days or any covenant breached, with only 30-day cure period for non-rent defaults.',
 'Minor breach could lead to lease termination.',
 'Tenant in default if rent unpaid for five (5) days or any covenant breached and not cured within thirty (30) days.',
 1),

-- MEDIUM
(analysis_lease, lease_id, 'excessive_penalties', 'medium', 58,
 'Attorneys Fees Provision',
 'Section 9.2 allows Landlord to recover all costs of collection including attorneys fees.',
 'Tenant bears Landlord legal costs even for good-faith disputes.',
 'Tenant shall pay all costs of collection, including reasonable attorneys fees.',
 2),

-- LOW
(analysis_lease, lease_id, 'restrictive_obligations', 'low', 45,
 'Restrictive Use and Hours',
 'Sections 6.1-6.3 limit use to restaurant operations and hours to 7 AM - 11 PM without consent.',
 'Limited flexibility for business operations.',
 'Premises shall be used solely for restaurant operations. Tenant shall not operate outside normal business hours without written consent.',
 1),

-- INFO
(analysis_lease, lease_id, 'confidentiality', 'info', 25,
 'Landlord Entry Rights',
 'Section 5.4 allows Landlord entry with only 24 hours notice for inspections and repairs.',
 'Limited privacy; Landlord can access frequently.',
 'Landlord may enter Premises upon 24 hours notice for inspections and repairs.',
 1);

-- ============================================================
-- OBLIGATIONS
-- ============================================================
INSERT INTO obligations (document_id, party, action, deadline, condition, source) VALUES
-- Service Agreement v1
(svc_v1_id, 'Service Provider', 'Perform services in professional manner', 'Ongoing', 'During term', 'Section 1.2'),
(svc_v1_id, 'Client', 'Pay monthly fee of $10,000', 'Within 15 days of invoice', 'Monthly', 'Section 3.1'),
(svc_v1_id, 'Service Provider', 'Indemnify Client for all claims', 'Upon claim', 'Any breach', 'Section 4.1'),
(svc_v1_id, 'Either Party', 'Provide 30 days written notice to terminate', '30 days before termination', 'If terminating', 'Section 2.2'),
(svc_v1_id, 'Either Party', 'Provide 60 days written notice of non-renewal', '60 days before term end', 'If not renewing', 'Section 2.4'),

-- NDA
(nda_id, 'Receiving Party', 'Hold Confidential Information in strict confidence', 'Ongoing', 'During term', 'Section 3.1'),
(nda_id, 'Receiving Party', 'Return or destroy Confidential Information', 'Upon termination', 'At termination or request', 'Section 5.2'),
(nda_id, 'Receiving Party', 'Not disclose without written consent', 'Ongoing', 'Always', 'Section 3.1'),

-- Employment Agreement
(emp_id, 'Employee', 'Devote full time and best efforts', 'During employment', 'Always', 'Section 1.2'),
(emp_id, 'Employee', 'Not engage in other employment', 'During employment', 'Without consent', 'Section 1.3'),
(emp_id, 'Employer', 'Pay bi-weekly salary of $145,000/year', 'Bi-weekly', 'During employment', 'Section 2.1'),
(emp_id, 'Employer', 'Pay signing bonus of $15,000', 'Within 30 days of start', 'At hire', 'Section 2.2'),
(emp_id, 'Employee', 'Assign all Work Product to Employer', 'Upon creation', 'Always', 'Section 5.1'),
(emp_id, 'Employee', 'Not compete for 18 months post-termination', '18 months after termination', 'Post-termination', 'Section 6.1'),

-- SaaS Subscription
(saas_id, 'Customer', 'Pay monthly installment of $4,000', 'Within 15 days of invoice', 'Monthly', 'Section 3.1'),
(saas_id, 'Provider', 'Maintain 99.5% uptime', 'Ongoing', 'During term', 'Section 1.3'),
(saas_id, 'Provider', 'Respond to critical issues within 4 hours', '4 hours', 'On report', 'Section 8.1'),
(saas_id, 'Customer', 'Provide 30 days notice for non-renewal', '30 days before term end', 'If not renewing', 'Section 2.2'),
(saas_id, 'Provider', 'Make data available for export', '30 days after termination', 'Upon termination', 'Section 4.5'),

-- Commercial Lease
(lease_id, 'Tenant', 'Pay monthly rent', '1st of each month', 'Monthly', 'Section 3.1'),
(lease_id, 'Landlord', 'Maintain structural repairs', 'As needed', 'When required', 'Section 5.1'),
(lease_id, 'Tenant', 'Maintain interior', 'Ongoing', 'Always', 'Section 5.2'),
(lease_id, 'Tenant', 'Pay security deposit of $25,500', 'At lease signing', 'Before occupancy', 'Section 4.1'),
(lease_id, 'Tenant', 'Maintain insurance of $2,000,000', 'Ongoing', 'During term', 'Section 8.1');

-- ============================================================
-- COMPARISON (Service Agreement v1 vs v2)
-- ============================================================
INSERT INTO comparisons (id, user_id, document_a_id, document_b_id, status, created_at, completed_at) VALUES
(comparison_id, demo_user_id, svc_v1_id, svc_v2_id, 'completed', now() - interval '6 days', now() - interval '6 days');

INSERT INTO comparison_changes (comparison_id, change_type, section, severity, description, evidence_a, evidence_b) VALUES
(comparison_id, 'modified_clause', '2.1', 'medium',
 'Term extended from 12 to 24 months',
 'This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months unless terminated earlier.',
 'This Agreement shall commence on the Effective Date and continue for a period of twenty-four (24) months unless terminated earlier.'),

(comparison_id, 'modified_clause', '2.2', 'low',
 'Termination notice extended from 30 to 60 days',
 'Either party may terminate this Agreement upon thirty (30) days written notice to the other party.',
 'Either party may terminate this Agreement upon sixty (60) days written notice to the other party.'),

(comparison_id, 'added_obligation', '2.5', 'low',
 'New post-termination delivery obligation added',
 '',
 'Upon termination, Service Provider shall deliver all work product to Client within fifteen (15) business days.'),

(comparison_id, 'shifted_liability', '3.1', 'medium',
 'Monthly fee increased from $10,000 to $12,000',
 'Client shall pay Service Provider a monthly fee of $10,000 for the Services.',
 'Client shall pay Service Provider a monthly fee of $12,000 for the Services.'),

(comparison_id, 'shifted_liability', '3.3', 'medium',
 'Late payment penalty increased from 1.5% to 2.0% monthly',
 'Late payments shall incur a penalty of 1.5% per month on the outstanding balance.',
 'Late payments shall incur a penalty of 2.0% per month on the outstanding balance.'),

(comparison_id, 'added_obligation', '3.5', 'high',
 'New $24,000 retainer requirement added',
 '',
 'Client shall provide a retainer of $24,000 prior to commencement of Services.'),

(comparison_id, 'omitted_protection', '4.2', 'high',
 'Uncapped liability clause REMOVED (beneficial to Service Provider)',
 'Service Provider shall be liable for all direct, indirect, incidental, special, consequential, and punitive damages regardless of the cause of action.',
 ''),

(comparison_id, 'modified_clause', '7.1-7.2', 'medium',
 'Liability cap changed and mutual cap added',
 'Service Providers total aggregate liability under this Agreement shall not exceed the fees paid by Client in the twelve (12) months preceding the claim.',
 'EXCEPT FOR OBLIGATIONS UNDER SECTION 4, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT DAMAGES. Service Providers total aggregate liability shall not exceed total fees paid under this Agreement.'),

(comparison_id, 'added_obligation', '8.1', 'high',
 'New non-compete clause added (12 months, California)',
 '',
 'During the term and for twelve (12) months following termination, Service Provider shall not provide substantially similar services to any direct competitor within California.'),

(comparison_id, 'modified_clause', '6.2', 'low',
 'Confidentiality period extended from 3 to 5 years',
 'Confidentiality obligations shall survive termination of this Agreement for a period of three (3) years.',
 'Confidentiality obligations shall survive termination of this Agreement for a period of five (5) years.'),

(comparison_id, 'added_obligation', '5.4', 'low',
 'New data usage restriction added',
 '',
 'Service Provider shall not use any Client data for purposes other than performing the Services under this Agreement.');

-- ============================================================
-- CHAT SESSION AND MESSAGES
-- ============================================================
INSERT INTO chat_sessions (id, user_id, document_id) VALUES
(chat_session, demo_user_id, svc_v1_id);

INSERT INTO chat_messages (session_id, role, content, grounded) VALUES
(chat_session, 'user', 'What are the termination provisions in this agreement?', true),
(chat_session, 'assistant', 'The agreement has several termination provisions under Section 2: (1) The initial term is 12 months (Section 2.1); (2) Either party may terminate with 30 days written notice (Section 2.2); (3) Client may terminate immediately for cause if Service Provider breaches any material term (Section 2.3); (4) The agreement auto-renews for 12-month periods unless 60 days written notice is given before the end of the current term (Section 2.4).', true),
(chat_session, 'user', 'What are the financial risks I should be aware of?', true),
(chat_session, 'assistant', 'Key financial risks include: (1) Section 3.4 makes ALL fees non-refundable regardless of circumstances; (2) Section 3.3 imposes a 1.5% monthly late penalty (18% annually) with only a 15-day payment window; (3) Section 4.2 creates unlimited liability exposure for consequential damages; (4) The auto-renewal in Section 2.4 with 60-day notice window could lock you into another year unintentionally.', true),
(chat_session, 'user', 'How does the IP assignment work?', true),
(chat_session, 'assistant', 'Under Section 5.1, ALL work product, deliverables, and materials created by Service Provider become the sole and exclusive property of Client. Service Provider retains pre-existing IP (Section 5.2) and gets a license to tools/methodologies (Section 5.3). The IP assignment is broad and covers everything created during the engagement.', true);

-- ============================================================
-- CITATIONS
-- ============================================================
INSERT INTO citations (message_id, section, page_number, quoted_text)
SELECT id, 'Section 2', 1, 'Either party may terminate this Agreement upon thirty (30) days written notice'
FROM chat_messages WHERE session_id = chat_session AND role = 'assistant' LIMIT 1;

-- ============================================================
-- CONSULTATION SHEET
-- ============================================================
INSERT INTO consultation_sheets (user_id, document_id, content) VALUES
(demo_user_id, svc_v1_id, '{
  "document_name": "service_agreement_v1.txt",
  "contract_type": "Service Agreement",
  "user_role": "Service Provider",
  "executive_overview": "This Service Agreement with TechCorp Inc. presents moderate-to-high risk for a Service Provider. The primary concerns are unlimited liability exposure under Section 4.2, broad indemnification obligations, and non-refundable fees. The 12-month auto-renewal with a 60-day notice window creates additional financial commitment risk.",
  "top_risks": [
    "CRITICAL: Uncapped consequential damages liability (Section 4.2) - unlimited financial exposure",
    "HIGH: Broad indemnification with no carve-outs (Section 4.1) - liable for any and all claims",
    "HIGH: All fees non-refundable (Section 3.4) - no recourse for unsatisfactory services"
  ],
  "key_obligations": [
    "Perform services in professional manner (Section 1.2)",
    "Indemnify Client for all claims arising from any breach (Section 4.1)",
    "Deliver all work product as sole property of Client (Section 5.1)"
  ],
  "deadlines": [
    "Payment due within 15 days of invoice (Section 3.1)",
    "60 days notice required for non-renewal (Section 2.4)",
    "30 days notice required for termination (Section 2.2)"
  ],
  "ambiguous_provisions": [
    "Section 1.2: professional and workmanlike manner - not defined",
    "Section 2.3: material term - not defined",
    "Section 4.1: reasonable attorneys fees - no cap specified"
  ],
  "questions_for_lawyer": [
    "Can we negotiate a mutual liability cap instead of the one-sided cap in Section 7?",
    "Is the 18% annual late payment penalty enforceable in this jurisdiction?",
    "Should we add a carve-out for gross negligence or willful misconduct in the indemnification?",
    "Can we negotiate a refund or credit mechanism for unused services?",
    "What are the implications of the auto-renewal clause if we miss the 60-day notice window?"
  ],
  "clauses_requiring_review": [
    "Section 4.2: Uncapped liability for consequential damages",
    "Section 4.1: Broad indemnification obligation",
    "Section 3.4: Non-refundable fees",
    "Section 2.4: Auto-renewal terms"
  ]
}'::jsonb);

RAISE NOTICE 'Demo seed data inserted successfully!';
END $$;

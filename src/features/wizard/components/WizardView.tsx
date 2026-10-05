import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/services/session/sessionStore';
import { useCampusStore } from '@/services/api/dataStore';
import { DEPARTMENTS } from '@/shared/lib/constants';
import { formatIndianDate } from '@/shared/lib/formatters';
import { ServiceGrid } from '@/shared/ui/ServiceGrid';
import { Button } from '@/shared/ui/Button';
import { Input, Select } from '@/shared/ui/Input';
import {
  Building2,
  Coins,
  GraduationCap,
  Printer,
  Send,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { DocType, Department, TargetAuthority } from '@/shared/types/app.types';

export const WizardView: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useSessionStore();
  const { submitApplication } = useCampusStore();

  const [docType, setDocType] = useState<DocType>('venue');

  // Form Fields
  const [title, setTitle] = useState(
    docType === 'venue'
      ? 'Auditorium Permission for Campus Event'
      : docType === 'financial'
      ? 'Merit-cum-Means Financial Assistance Grant'
      : 'Duty Leave & Examination NOC Request'
  );
  const [studentName, setStudentName] = useState(profile?.fullName || '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '');
  const [department, setDepartment] = useState<Department>(profile?.department || 'CSE');

  // Venue Specific
  const [venue, setVenue] = useState('Main University Auditorium');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [expectedAttendance, setExpectedAttendance] = useState('');

  // Financial Specific
  const [cgpa, setCgpa] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [financialReason, setFinancialReason] = useState('');

  // NOC Specific
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [nocReason, setNocReason] = useState('');

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const getTargetAuthority = (): TargetAuthority => {
    switch (docType) {
      case 'venue':
        return 'Dean of Student Welfare';
      case 'financial':
        return 'Financial Aid Committee';
      case 'noc':
        return 'Head of Department';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData =
      docType === 'venue'
        ? { venue, eventDate, eventTime, expectedAttendance, email: profile?.email || 'student@rbu.ac.in' }
        : docType === 'financial'
        ? { cgpa, familyIncome, requestedAmount, reason: financialReason, email: profile?.email || 'student@rbu.ac.in' }
        : { examName, examDate, reason: nocReason, email: profile?.email || 'student@rbu.ac.in' };

    const newApp = await submitApplication({
      docType,
      title,
      studentName,
      rollNumber,
      department,
      email: profile?.email || 'student@rbu.ac.in',
      targetAuthority: getTargetAuthority(),
      formData,
    });

    setSubmittedRef(newApp.trackingRef);
  };

  // Circular service controls mapping for the 3 official letter templates
  const templateServices = [
    {
      id: 'venue',
      title: 'Venue Permission',
      subtitle: 'Dean of Student Welfare',
      icon: Building2,
      isActive: docType === 'venue',
      onClick: () => {
        setDocType('venue');
        setTitle('Auditorium Permission for Annual Cultural Showcase');
      },
    },
    {
      id: 'financial',
      title: 'Financial Grant',
      subtitle: 'Merit-cum-Means Committee',
      icon: Coins,
      isActive: docType === 'financial',
      onClick: () => {
        setDocType('financial');
        setTitle('Merit-cum-Means Financial Assistance Grant');
      },
    },
    {
      id: 'noc',
      title: 'Exam NOC / Leave',
      subtitle: 'Department HOD',
      icon: GraduationCap,
      isActive: docType === 'noc',
      onClick: () => {
        setDocType('noc');
        setTitle('MST Examination Absence / Duty Leave NOC');
      },
    },
  ];

  const formattedToday = formatIndianDate(new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 no-print">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          University Document Letterhead Wizard
        </h1>
        <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
          Generate official Rayat Bahra University memorandums, letters, and NOCs in under 60
          seconds with live A4 preview.
        </p>
      </div>

      {/* 2. Soft Circular Service Controls (Template Picker) */}
      <div className="no-print">
        <ServiceGrid
          title="SELECT OFFICIAL TEMPLATE"
          subtitle="Choose document format to load official endorsement parameters"
          items={templateServices}
        />
      </div>

      {/* Submission Success Toast */}
      {submittedRef && (
        <div
          className="soft-card p-4 flex items-center justify-between no-print max-w-4xl mx-auto border-emerald-500/30"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Application Recorded in Supabase!
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                Tracking REF: {submittedRef}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/applications')}>
            Track Status
          </Button>
        </div>
      )}

      {/* 3. Two-Column Workspace: Parameters on Left, A4 Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Left Parameter Form (lg:col-span-5) */}
        <div className="lg:col-span-5 soft-card p-6 space-y-5 no-print">
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Document Parameters
            </h3>
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Subject / Memorandum Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
              <Input
                label="Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>

            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              required
            />

            {/* Template Specific Inputs */}
            {docType === 'venue' && (
              <>
                <Input
                  label="Target Campus Venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Estimated Attendance"
                  type="number"
                  value={expectedAttendance}
                  onChange={(e) => setExpectedAttendance(e.target.value)}
                  required
                />
              </>
            )}

            {docType === 'financial' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Current CGPA"
                    type="number"
                    step="0.01"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                  <Input
                    label="Annual Family Income (₹)"
                    type="number"
                    value={familyIncome}
                    onChange={(e) => setFamilyIncome(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Requested Grant (₹)"
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Justification / Purpose
                  </label>
                  <textarea
                    rows={3}
                    value={financialReason}
                    onChange={(e) => setFinancialReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--surface-border)',
                      color: 'var(--text-primary)',
                    }}
                    required
                  />
                </div>
              </>
            )}

            {docType === 'noc' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Examination"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    required
                  />
                  <Input
                    label="Exam Date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Grounds for Duty Leave
                  </label>
                  <textarea
                    rows={3}
                    value={nocReason}
                    onChange={(e) => setNocReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--surface-border)',
                      color: 'var(--text-primary)',
                    }}
                    required
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </form>

          <p className="text-xs flex items-center gap-1.5 pt-2" style={{ color: 'var(--text-muted)' }}>
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            Print creates an authentic black & white official A4 memorandum.
          </p>
        </div>

        {/* Right Live A4 Memorandum Preview (lg:col-span-7) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="letterhead-container w-full max-w-[210mm] bg-white text-black p-8 sm:p-12 shadow-xl rounded-sm border border-slate-300 min-h-[680px] flex flex-col justify-between font-serif">
            <div>
              {/* University Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black">
                  Rayat Bahra University
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 font-sans tracking-wide">
                  V.P.O. Sahauran, Tehsil Kharar, Distt. Mohali, Punjab – 140104
                </p>
                <p className="text-[11px] font-sans text-gray-600">
                  Established under Punjab Act No. 16 of 2014 • UGC Recognized
                </p>
              </div>

              {/* Reference & Date */}
              <div className="flex justify-between items-center text-xs sm:text-sm font-mono text-gray-800 mb-6 pb-2 border-b border-gray-300">
                <span>
                  REF:{' '}
                  <strong>
                    RBU/
                    {docType === 'venue'
                      ? 'DSW'
                      : docType === 'financial'
                      ? 'FAC'
                      : department || 'GEN'}
                    /2026/
                    {docType === 'venue' ? 'PERM' : docType === 'financial' ? 'FIN' : 'NOC'}-
                    {Math.floor(1000 + Math.random() * 9000)}
                  </strong>
                </span>
                <span>Date: {formattedToday}</span>
              </div>

              {/* Addressee */}
              <div className="text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                <p className="font-semibold text-black">To,</p>
                <p className="text-black font-medium">{getTargetAuthority()}</p>
                <p className="text-gray-700">Rayat Bahra University, Mohali Campus</p>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <p className="text-xs sm:text-sm font-bold text-black border-l-4 border-black pl-3 py-0.5">
                  SUBJECT: {title.toUpperCase()}
                </p>
              </div>

              {/* Salutation & Body */}
              <div className="text-xs sm:text-sm space-y-4 text-gray-900 leading-relaxed">
                <p>Respected Sir / Madam,</p>
                <p>
                  I, <strong>{studentName}</strong> (Roll No:{' '}
                  <span className="font-mono">{rollNumber}</span>), currently enrolled in the
                  Department of <strong>{department}</strong>, hereby formally submit this
                  application regarding <em>{title}</em>.
                </p>

                {/* Structured parameters summary table */}
                <table className="w-full border-collapse border border-black my-4 text-xs font-sans">
                  <tbody>
                    <tr className="bg-gray-100">
                      <td className="border border-black px-3 py-1.5 font-bold w-1/3">Applicant</td>
                      <td className="border border-black px-3 py-1.5">
                        {studentName} ({rollNumber})
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-3 py-1.5 font-bold">Department</td>
                      <td className="border border-black px-3 py-1.5">{department}</td>
                    </tr>

                    {docType === 'venue' && (
                      <>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">Target Venue</td>
                          <td className="border border-black px-3 py-1.5">{venue}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-3 py-1.5 font-bold">Date & Time</td>
                          <td className="border border-black px-3 py-1.5">
                            {eventDate} at {eventTime} IST
                          </td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">
                            Estimated Attendance
                          </td>
                          <td className="border border-black px-3 py-1.5">
                            {expectedAttendance} Students
                          </td>
                        </tr>
                      </>
                    )}

                    {docType === 'financial' && (
                      <>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">Current CGPA</td>
                          <td className="border border-black px-3 py-1.5">{cgpa} / 10.0</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-3 py-1.5 font-bold">Annual Income</td>
                          <td className="border border-black px-3 py-1.5">₹ {familyIncome}</td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">Grant Requested</td>
                          <td className="border border-black px-3 py-1.5">₹ {requestedAmount}</td>
                        </tr>
                      </>
                    )}

                    {docType === 'noc' && (
                      <>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">Examination</td>
                          <td className="border border-black px-3 py-1.5">{examName}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-3 py-1.5 font-bold">Exam Date</td>
                          <td className="border border-black px-3 py-1.5">{examDate}</td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td className="border border-black px-3 py-1.5 font-bold">Duty Leave Ground</td>
                          <td className="border border-black px-3 py-1.5">{nocReason}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>

                <p>
                  It is kindly requested that necessary approvals be accorded for the aforementioned
                  matter.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-10 mt-8 border-t border-gray-400 grid grid-cols-2 gap-8 text-xs font-sans text-gray-800">
              <div className="space-y-6">
                <div className="border-b border-black w-36 h-6"></div>
                <p>
                  <strong>Applicant's Signature</strong>
                  <br />
                  {studentName}
                </p>
              </div>

              <div className="space-y-6 text-right">
                <div className="border-b border-black w-36 h-6 ml-auto"></div>
                <p>
                  <strong>Endorsement & Stamp</strong>
                  <br />
                  {getTargetAuthority()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

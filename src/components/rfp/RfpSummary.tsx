import React from 'react';
import ComplianceMatrix from './ComplianceMatrix';
import TimelineTable from './TimelineTable';

interface RfpData {
  id: string;
  issuingOrg: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
}

interface RfpSummaryProps {
  rfpData?: RfpData;
}

export default function RfpSummary({ rfpData }: RfpSummaryProps) {
  const defaultRfpData = {
    id: "RFP #24-25810C",
    issuingOrg: "Sacramento City Unified School District",
    contactName: "Melanie Gutierrez",
    contactTitle: "Buyer III",
    contactEmail: "Melanie@scusd.edu"
  };

  const data = rfpData || defaultRfpData;

  return (
    <div className="max-w-full mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Compliance Matrix for {data.id}</h1>
      
      {/* RFP IDENTIFICATION */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">1️ RFP IDENTIFICATION</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>RFP Identifier:</strong> {data.id}</li>
          <li><strong>Classification Codes:</strong> Not specified</li>
          <li><strong>Issuing Organization:</strong> {data.issuingOrg}</li>
          <li>
            <strong>Contact Personnel:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Name:</strong> {data.contactName || "Not specified"}</li>
              <li><strong>Title:</strong> {data.contactTitle || "Not specified"}</li>
              <li><strong>Role:</strong> Primary Contact</li>
              <li><strong>Phone:</strong> Not provided</li>
              <li><strong>Email:</strong> {data.contactEmail || "Not specified"}</li>
            </ul>
          </li>
        </ul>
      </div>
      
      {/* TIMELINE */}
      <div className="mb-8">
        <TimelineTable />
        <div className="mt-4">
          <strong>Addenda & Amendments:</strong> Addenda will be numbered consecutively and sent electronically to all parties.
        </div>
      </div>
      
      {/* COMPLIANCE MATRIX */}
      <div className="mb-8">
        <ComplianceMatrix />
      </div>
      
      {/* CONTRACT TERMS & PRICING */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">4️ CONTRACT TERMS & PRICING</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Contract Duration:</strong> One (1) year with the option of two (2), one (1) year extensions.</li>
          <li><strong>Pricing Structure:</strong> Not explicitly stated, but includes product pricing sheet.</li>
          <li><strong>Budget:</strong> Not specified.</li>
        </ul>
      </div>
      
      {/* SUBMISSION REQUIREMENTS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">5️ SUBMISSION REQUIREMENTS</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Submission Method:</strong> Electronic via Planet Bids.</li>
          <li>
            <strong>Required Documents:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Non-Collusion Declaration</li>
              <li>Product Pricing Sheet</li>
              <li>Specifications/Product Formulation Statement</li>
              <li>References Sheet</li>
              <li>Piggyback Clause</li>
              <li>Authorized Vendor Signature</li>
              <li>Vendor Application (if not a current District vendor)</li>
            </ul>
          </li>
        </ul>
      </div>
      
      {/* GO/NO-GO ASSESSMENT */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">6️ GO/NO-GO ASSESSMENT</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Risk of non-compliance with electronic submission requirements.</li>
          <li>Potential issues with meeting Buy American Provision exceptions.</li>
        </ul>
      </div>
      
      {/* CLARIFICATION NEEDS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">7️ CLARIFICATION NEEDS</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Clarification on pricing structure and budget caps.</li>
          <li>Clarification on the requirement for performance guarantee and conditions for its application.</li>
        </ul>
      </div>
    </div>
  );
} 

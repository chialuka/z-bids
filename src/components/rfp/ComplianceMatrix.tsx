import React from 'react';

interface ComplianceMatrixProps {
  data?: {
    id: string;
    description: string;
    type: string;
    criteria: string;
    level: string;
    proof: string;
    pageRef: string;
    notes: string;
  }[];
}

export default function ComplianceMatrix({ data }: ComplianceMatrixProps) {
  // Default data if none is provided
  const defaultData = [
    {
      id: "REQ-001",
      description: "Vendor must submit proposals electronically via Planet Bids.",
      type: "Mandatory",
      criteria: "Submission Compliance",
      level: "Meets / Partially Meets / Does Not Meet",
      proof: "Electronic Submission Confirmation",
      pageRef: "Page 1",
      notes: "Paper, oral, telegraphic, facsimile, telephone or email submissions will not be accepted."
    },
    {
      id: "REQ-002",
      description: "Proposal must include Non-Collusion Declaration, Product Pricing Sheet, and other specified documents.",
      type: "Mandatory",
      criteria: "Document Compliance",
      level: "Meets / Partially Meets / Does Not Meet",
      proof: "Document Review",
      pageRef: "Page 3",
      notes: "Includes Authorized Vendor Signature and Vendor Application if not a current District vendor."
    },
    {
      id: "REQ-003",
      description: "Vendor must comply with Buy American Provision.",
      type: "Mandatory",
      criteria: "Regulatory Compliance",
      level: "Meets / Partially Meets / Does Not Meet",
      proof: "Product Documentation",
      pageRef: "Page 4",
      notes: "Exceptions to be approved upon request."
    },
    {
      id: "REQ-004",
      description: "Vendor must provide a performance guarantee if required.",
      type: "Conditional",
      criteria: "Performance Assurance",
      level: "Meets / Partially Meets / Does Not Meet",
      proof: "Performance Bond",
      pageRef: "Page 5",
      notes: "100% of the total amount of the award."
    },
    {
      id: "REQ-005",
      description: "Vendor must comply with insurance requirements.",
      type: "Mandatory",
      criteria: "Insurance Compliance",
      level: "Meets / Partially Meets / Does Not Meet",
      proof: "Insurance Certificate",
      pageRef: "Page 6",
      notes: "Include Sacramento City Unified School District as additional insured."
    }
  ];

  const matrixData = data || defaultData;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">3️ COMPLIANCE MATRIX</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Requirement ID</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Evaluation Criteria</th>
            <th className="border border-gray-300 px-4 py-2">Compliance Level</th>
            <th className="border border-gray-300 px-4 py-2">Proof Required</th>
            <th className="border border-gray-300 px-4 py-2">Page Ref</th>
            <th className="border border-gray-300 px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {matrixData.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-4 py-2">{item.id}</td>
              <td className="border border-gray-300 px-4 py-2">{item.description}</td>
              <td className="border border-gray-300 px-4 py-2">{item.type}</td>
              <td className="border border-gray-300 px-4 py-2">{item.criteria}</td>
              <td className="border border-gray-300 px-4 py-2">{item.level}</td>
              <td className="border border-gray-300 px-4 py-2">{item.proof}</td>
              <td className="border border-gray-300 px-4 py-2">{item.pageRef}</td>
              <td className="border border-gray-300 px-4 py-2">{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 

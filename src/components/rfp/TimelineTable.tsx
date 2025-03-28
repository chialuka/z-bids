import React from 'react';

interface TimelineEvent {
  event: string;
  date: string;
  time?: string;
}

interface TimelineTableProps {
  events?: TimelineEvent[];
}

export default function TimelineTable({ events }: TimelineTableProps) {
  // Default data if none is provided
  const defaultEvents = [
    {
      event: "Publish and advertise RFP",
      date: "November 8, 2024",
      time: ""
    },
    {
      event: "Last day to receive questions from Respondents",
      date: "November 18, 2024",
      time: "5:00 pm (PT)"
    },
    {
      event: "Deadline for submissions",
      date: "December 6, 2024",
      time: "2:00 pm (PT)"
    },
    {
      event: "Notice of Intent to Award",
      date: "December 20, 2024",
      time: ""
    },
    {
      event: "Anticipated Board of Education approval",
      date: "January 16, 2025",
      time: ""
    },
    {
      event: "Anticipated purchase order issued",
      date: "January 23, 2025",
      time: ""
    }
  ];

  const timelineData = events || defaultEvents;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">2️ TIMELINE</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Key Events</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {timelineData.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-4 py-2">{item.event}</td>
              <td className="border border-gray-300 px-4 py-2">{item.date}</td>
              <td className="border border-gray-300 px-4 py-2">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 

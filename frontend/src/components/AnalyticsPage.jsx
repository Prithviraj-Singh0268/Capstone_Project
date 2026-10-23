import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const AnalyticsPage = ({ sessionId }) => {
    const [trendData, setTrendData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            fetchTrends(sessionId);
            fetchAttendance(sessionId);
        }
    }, [sessionId]);

    const fetchTrends = async (sid) => {
        try {
            const res = await fetch(`http://localhost:8000/api/analytics/trends/${sid}`);
            const data = await res.json();
            setTrendData(data);
        } catch (e) {
            console.error("Failed to fetch trends", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (sid) => {
        try {
            const res = await fetch(`http://localhost:8000/api/analytics/attendance/${sid}`);
            const data = await res.json();
            setAttendanceData(data);
        } catch (e) {
            console.error("Failed to fetch attendance", e);
        }
    };

    const handleExport = (type) => {
        window.location.href = `http://localhost:8000/api/reports/export/${sessionId}/${type}`;
    };

    if (loading) return <div className="p-8 text-white">Loading Analytics...</div>;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Session Analytics
                    </h1>
                    <p className="text-slate-400">Deep dive into clssroom engagement</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition">
                        <Download size={18} /> PDF Report
                    </button>
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition">
                        <Download size={18} /> CSV Data
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attention Trend */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold mb-4">Attention Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Legend />
                                <Line type="monotone" dataKey="avg_attention" stroke="#8884d8" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Emotion Stack */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold mb-4">Emotion Distribution Over Time</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Bar dataKey="happy" stackId="a" fill="#4ade80" />
                                <Bar dataKey="neutral" stackId="a" fill="#94a3b8" />
                                <Bar dataKey="bored" stackId="a" fill="#f87171" />
                                <Bar dataKey="confused" stackId="a" fill="#fbbf24" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Attendance & Presence Table */}
            <div className="mt-8 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold mb-2">Presence-Based Attendance Summary</h3>
                <p className="text-xs text-slate-400 mb-4">Thresholds: Present (&ge; 75%), Partial (40% - 74%), Absent (&lt; 40%)</p>
                
                {attendanceData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4">Participant ID</th>
                                    <th className="py-3 px-4">Active Duration</th>
                                    <th className="py-3 px-4">Presence %</th>
                                    <th className="py-3 px-4">Attendance Status</th>
                                    <th className="py-3 px-4">Avg Attention</th>
                                    <th className="py-3 px-4">Dominant Emotion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {attendanceData.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                                        <td className="py-3 px-4 font-mono font-medium text-slate-200">{student.id}</td>
                                        <td className="py-3 px-4 text-slate-300">{student.presence_seconds}s</td>
                                        <td className="py-3 px-4 text-slate-300">{student.presence_percentage}%</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${student.attendance_status === 'Present' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                  student.attendance_status === 'Partial' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                  'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                {student.attendance_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{student.attention}%</td>
                                        <td className="py-3 px-4 text-slate-300 capitalize">{student.dominant_emotion || 'neutral'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm py-4 italic">No individual participant records found for this session.</div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;

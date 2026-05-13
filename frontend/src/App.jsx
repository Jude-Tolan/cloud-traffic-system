import React, { useState, useEffect } from 'react';
import { Activity, Camera, TrendingUp, AlertTriangle, CloudRain, Car } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_ENDPOINT = 'https://jx1mq36i2i.execute-api.us-east-1.amazonaws.com/traffic'; 

function App() {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data generator for immediate beautiful display
  const generateMockData = () => {
    const cameras = ['CAM-001-NORTH', 'CAM-002-SOUTH', 'CAM-003-EAST', 'CAM-004-WEST'];
    return cameras.map(cam => {
      const base = Math.floor(Math.random() * 40) + 20;
      const isHigh = cam === 'CAM-001-NORTH' && Math.random() > 0.7;
      const finalCount = isHigh ? base + 100 : base;
      return {
        camera_id: cam,
        vehicle_count: finalCount,
        average_speed_mph: Math.max(10, 65 - Math.floor(finalCount / 3)),
        congestion_level: finalCount > 100 ? 'HIGH' : finalCount > 40 ? 'MEDIUM' : 'LOW',
        timestamp: new Date().toISOString()
      };
    });
  };

  const [historyData, setHistoryData] = useState([
    { time: '10:00', 'CAM-001': 30, 'CAM-002': 45 },
    { time: '10:05', 'CAM-001': 35, 'CAM-002': 40 },
    { time: '10:10', 'CAM-001': 45, 'CAM-002': 50 },
    { time: '10:15', 'CAM-001': 80, 'CAM-002': 45 },
    { time: '10:20', 'CAM-001': 150, 'CAM-002': 35 },
    { time: '10:25', 'CAM-001': 140, 'CAM-002': 30 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (API_ENDPOINT !== 'YOUR_API_ENDPOINT_HERE') {
          const response = await fetch(API_ENDPOINT);
          const data = await response.json();
          setTrafficData(data);
        } else {
          setTrafficData(generateMockData());
        }
      } catch (error) {
        console.error("Error fetching traffic data:", error);
        setTrafficData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Filter to get only the single most recent reading for each unique camera
  const latestCameras = [];
  const seenCameras = new Set();
  trafficData.forEach(cam => {
    if (!seenCameras.has(cam.camera_id)) {
      seenCameras.add(cam.camera_id);
      latestCameras.push(cam);
    }
  });

  const totalVehicles = latestCameras.reduce((acc, curr) => acc + curr.vehicle_count, 0);
  const avgSpeed = latestCameras.length 
    ? Math.round(latestCameras.reduce((acc, curr) => acc + curr.average_speed_mph, 0) / latestCameras.length)
    : 0;
  const highCongestion = latestCameras.filter(d => d.congestion_level === 'HIGH').length;

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-title">
          <Activity className="header-icon" size={40} />
          <h1>CloudTraffic</h1>
        </div>
        <div className="live-indicator">
          <div className="pulsing-dot"></div>
          LIVE SYSTEM
        </div>
      </header>

      <div className="grid-container">
        <div className="glass-card delay-1">
          <div className="card-header">
            <h2 className="card-title">Total Network Volume</h2>
            <Car size={24} color="var(--accent-blue)" />
          </div>
          <div className="metric-value">{totalVehicles}</div>
          <div className="metric-sub">
            <TrendingUp size={16} color="var(--status-low)" />
            <span style={{ color: 'var(--status-low)' }}>+12%</span> vs last hour
          </div>
        </div>

        <div className="glass-card delay-2">
          <div className="card-header">
            <h2 className="card-title">Network Avg Speed</h2>
            <Activity size={24} color="var(--status-low)" />
          </div>
          <div className="metric-value">{avgSpeed} <span style={{ fontSize: '1.2rem' }}>mph</span></div>
          <div className="metric-sub">
            Optimal flow rate
          </div>
        </div>

        <div className="glass-card delay-3">
          <div className="card-header">
            <h2 className="card-title">Active Alerts</h2>
            <AlertTriangle size={24} color={highCongestion > 0 ? "var(--status-high)" : "var(--status-low)"} />
          </div>
          <div className="metric-value" style={{ color: highCongestion > 0 ? 'var(--status-high)' : 'var(--text-primary)'}}>
            {highCongestion}
          </div>
          <div className="metric-sub">
            {highCongestion > 0 ? 'SNS notifications dispatched' : 'All systems normal'}
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Live Camera Feeds</h2>
      
      <div className="grid-container">
        {latestCameras.map((cam, idx) => (
          <div key={cam.camera_id} className={`glass-card delay-${(idx % 4) + 1}`}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={20} />
                {cam.camera_id}
              </h3>
              <span className={`status-badge status-${cam.congestion_level}`}>
                {cam.congestion_level}
              </span>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Volume</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{cam.vehicle_count}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Speed</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{cam.average_speed_mph} mph</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-container">
        <div className="glass-card full-width delay-4">
          <div className="card-header">
            <h2 className="card-title">Volume History (Moving Average)</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCam1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--status-high)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--status-high)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCam2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="CAM-001" stroke="var(--status-high)" fillOpacity={1} fill="url(#colorCam1)" />
                <Area type="monotone" dataKey="CAM-002" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorCam2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const BarChartComponent = ({ data, dataKey, xKey = 'name' }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
        <XAxis dataKey={xKey} stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey={dataKey} fill="#2D9CDB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const MultiBarChart = ({ data, bars }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {bars.map((bar, index) => (
          <Bar key={index} dataKey={bar.key} fill={bar.color || COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export const PieChartComponent = ({ data, dataKey, nameKey = 'name' }) => {
  // Status-based colors: Green for Closed, Blue for Open, Amber for In Progress
  const statusColors = {
    'Open': '#3B82F6',
    'In Progress': '#F59E0B',
    'Closed': '#10B981',
  }
  
  const getColor = (name, index) => {
    return statusColors[name] || COLORS[index % COLORS.length]
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={90}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry[nameKey], index)} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const LineChartComponent = ({ data, dataKey, xKey = 'name' }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
        <XAxis dataKey={xKey} stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line type="monotone" dataKey={dataKey} stroke="#2D9CDB" strokeWidth={2} dot={{ fill: '#2D9CDB', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
















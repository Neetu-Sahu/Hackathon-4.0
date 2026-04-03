// import { Bar } from "react-chartjs-2";
// import { useEffect, useState } from "react";

// function PriorityChart(){

//   const [data,setData] = useState([]);

//   useEffect(()=>{

//     fetch("http://localhost:8000/priority-ranking")
//       .then(res => res.json())
//       .then(result => {

//         const top = result
//           .sort((a,b)=> b.priority_score - a.priority_score)
//           .slice(0,5);

//         setData(top);

//       });

//   },[]);

//   const chartData = {

//     labels: data.map(d => d.district),

//     datasets:[
//       {
//         label:"Priority Score",
//         data: data.map(d => d.priority_score),
//         backgroundColor:"red"
//       }
//     ]
//   };

//   return(
//     <div>
//       <h4>Highest Priority Districts</h4>
//       <Bar
//       id="priorityChart"
//       data={chartData}
//       />
//     </div>
//   );
// }

// export default PriorityChart;
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function PriorityChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Using fetch to match your existing pattern, but swapping to Recharts
    fetch("http://localhost:8000/priority-ranking")
      .then((res) => res.json())
      .then((result) => {
        const top = result
          .sort((a, b) => b.priority_score - a.priority_score)
          .slice(0,5);
        setData(top);
      });
  }, []);

  return (
    <div style={{ width: "100%", height: 300, background: "#fff", padding: "10px", borderRadius: "8px" }}>
      <h4 style={{ textAlign: "center", color: "#1e293b" }}>Highest Priority Districts</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <XAxis dataKey="district" tick={{ fontSize: 20 }} interval={0} angle={-45}  textAnchor="end" height={80} fontSize={20}  />
          <YAxis tick={{ fill: '#64748b' }} fontSize={12}/>
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          {/* Using a color scale: higher priority = darker red */}
          <Bar dataKey="priority_score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.priority_score > 80 ? "#ef4444" : "#f87171"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriorityChart;
import MapView from "../components/MapView";
import DistrictTable from "../components/DistrictTable";
import Charts from "../components/Charts";
import PriorityTable from "../components/PriorityTable";
import PopulationChart from "../components/PopulationChart";
import Insights from "../components/Insights";
import SummaryCards from "../components/SummaryCards";
import AIPolicyAdvisor from "../components/AIPolicyAdvisor";
// import PriorityChart from "../components/PriorityChart";
function Dashboard() {
  return (
    <div style={{padding:"20px"}}>

      <h2>Policy Dashboard</h2>

      <MapView/>

      <br/>

      <h2>Analytics Dashboard</h2>
    <AIPolicyAdvisor />
      <SummaryCards />
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"30px",
        marginTop:"20px"
        }}>
        

      <Charts />

      <PopulationChart />
      </div>
      <br/>
      <h2 style={{marginTop:"20px"}}>Policy Insights</h2>
      <Insights />

      <br/>
      
      <DistrictTable/>
      <br/>
      
      <PriorityTable/>

    </div>
  );
}

export default Dashboard;
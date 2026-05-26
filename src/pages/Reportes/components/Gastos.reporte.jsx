// src/components/ReporteGastos.component.jsx
import { Row, Col, Card, Typography, List } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const { Title, Text } = Typography;

const formatK = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

const GastosGrafica = ({ data }) => {
  if (!data) return null;

  const lineChartData = {
    labels: Object.keys(data.semanal_gastos || {}),
    datasets: [
      {
        label: 'Gastos',
        data: Object.values(data.semanal_gastos || {}),
        borderColor: '#4EACEC',
        borderWidth: 4,
        backgroundColor: '#4EACEC',
        tension: 0,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4EACEC',
        pointBorderWidth: 5,
        pointRadius: 8,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const doughnutChartData = {
    labels: (data.distribucion_gastos || []).map(item => item.nombre),
    datasets: [
      {
        data: (data.distribucion_gastos || []).map(item => item.porcentaje),
        backgroundColor: ['#E73F3F', '#F1A139', '#97C56A', '#4EACEC', '#444B42'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  return (
    <div style={{ padding: '0 25px' }}>
      
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Estadísticas de Gastos (Semanal)</Title>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Top 5 Gastos</Title>
            <div style={{ height: '250px', overflowY: 'auto' }}>
              <List
                dataSource={(data.top5_gastos || [])}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      <span style={{ color: '#E73F3F', marginRight: '10px' }}>{index + 1}.</span> {item.nombre}
                    </Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', marginRight: 40 }}>
                      ${item.cantidad}
                    </Text>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Distribución de Gastos</Title>
            <div style={{ height: '250px' }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Row gutter={24} style={{ height: '100%' }}>
            
            <Col span={12} style={{ display: 'flex' }}>
              <Card 
                style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                  border: 'none', 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center' 
                }}
              >
                <Text style={{ fontSize: '20px', fontWeight: '200', color: '#888' }}>
                  Total en gastos
                </Text>
                <Title level={1} style={{ margin: '20px 0 10px 0', color: '#E73F3F', fontWeight: 900, fontSize: '90px' }}>
                  ${formatK(data.total_gasto_periodo)}
                </Title>
                <Text style={{ fontSize: '20px', fontWeight: '200', color: '#888' }}>
                  MXN
                </Text>
              </Card>
            </Col>
            
            <Col span={12} style={{ display: 'flex' }}>
              <Card 
                style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                  border: 'none', 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center' 
                }}
              >
                <Text style={{ fontSize: '20px', fontWeight: '200', color: '#888' }}>
                  Promedio por gasto
                </Text>
                <Title level={1} style={{ margin: '20px 0 10px 0', color: '#F1A139', fontWeight: 900, fontSize: '90px' }}>
                  ${formatK(data.promedio_por_gasto)}
                </Title>
                <Text style={{ fontSize: '20px', fontWeight: '200', color: '#888' }}>
                  MXN
                </Text>
              </Card>
            </Col>

          </Row>
        </Col>
      </Row>

    </div>
  );
};

export default GastosGrafica;
// src/components/ReportePedidos.component.jsx
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
  ArcElement
);

const { Title, Text } = Typography;

const PedidosGrafica = ({ data }) => {
  if (!data) return null;

  const lineChartData = {
    labels: Object.keys(data.semanal_pedidos || {}),
    datasets: [
      {
        label: 'Pedidos',
        data: Object.values(data.semanal_pedidos || {}),
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
    labels: (data.distribucion_pedidos || []).map(item => item.nombre),
    datasets: [
      {
        data: (data.distribucion_pedidos || []).map(item => item.porcentaje),
        backgroundColor: ['#F1A139', '#97C56A', '#E73F3F', '#444B42'],
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
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Estadísticas de Pedidos (Semanal)</Title>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Productos más vendidos</Title>
            <List
              dataSource={(data.productos_mas_vendidos || []).filter(p => p !== "")}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                    <span style={{ color: '#F1A139', marginRight: '10px' }}>{index + 1}.</span> {item}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Distribución de pedidos</Title>
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
                <Text style={{ fontSize: '25px', fontWeight: '200', color: '#888' }}>
                  Tiempo promedio de pedido
                </Text>
                <Title level={1} style={{ margin: '20px 0 10px 0', color: '#F1A139', fontWeight: 900, fontSize: '130px' }}>
                  {data.tiempo_pedido_promedio_min}
                </Title>
                <Text style={{ fontSize: '25px', fontWeight: '200', color: '#888' }}>
                  minutos
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
                <Text style={{ fontSize: '25px', fontWeight: '200', color: '#888' }}>
                  Pedidos promedio al día
                </Text>
                <Title level={1} style={{ margin: '20px 0 10px 0', color: '#4EACEC', fontWeight: 900, fontSize: '130px' }}>
                  {data.pedidos_promedio_dia}
                </Title>
                <Text style={{ fontSize: '25px', fontWeight: '200', color: '#888' }}>
                  pedidos
                </Text>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

    </div>
  );
};

export default PedidosGrafica;
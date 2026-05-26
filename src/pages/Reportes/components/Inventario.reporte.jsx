// src/pages/admin/components/Inventario.reporte.jsx
import { Row, Col, Card, Typography, List } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const { Title, Text } = Typography;

const InventarioGrafico = ({ data }) => {
  if (!data) return null;

  const lineChartData = {
    labels: Object.keys(data.semanal_mermas || {}),
    datasets: [
      {
        label: 'Mermas',
        data: Object.values(data.semanal_mermas || {}),
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

  const radarChartData = {
    labels: (data.top5_mermas || []).map(item => item.nombre),
    datasets: [
      {
        label: 'Cantidad',
        data: (data.top5_mermas || []).map(item => item.cantidad),
        borderColor: '#97C56A',
        backgroundColor: 'rgba(151, 197, 106, 0.4)',
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#97C56A',
        pointBorderWidth: 2,
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        beginAtZero: true
      }
    },
  };

  const doughnutChartData = {
    labels: (data.distribucion_mermas || []).map(item => item.nombre),
    datasets: [
      {
        data: (data.distribucion_mermas || []).map(item => item.porcentaje),
        backgroundColor: ['#F1A139', '#97C56A', '#E73F3F', '#444B42', '#888888'],
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
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Registro de Mermas (Semanal)</Title>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Insumos más usados</Title>
            <List
              dataSource={(data["5insumos_mas_usados"] || []).filter(p => p !== "")}
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
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Distribución de Mermas</Title>
            <div style={{ height: '250px' }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Top 5 Mermas</Title>
            <div style={{ height: '250px' }}>
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default InventarioGrafico;
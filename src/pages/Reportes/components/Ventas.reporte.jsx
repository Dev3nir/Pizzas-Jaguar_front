// src/components/ReporteVentas.component.jsx
import { Row, Col, Card, Typography } from "antd";
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

const formatK = (num) => {
  if (num == null) return "$0";
  if (num >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'k';
  }
  return '$' + (Number.isInteger(num) ? num : parseFloat(num).toFixed(2));
};

const VentasGrafica = ({ data }) => {
  if (!data) return null;

  const lineChartData = {
    labels: Object.keys(data.semanal_ventas || {}),
    datasets: [
      {
        label: 'Ventas ($)',
        data: Object.values(data.semanal_ventas || {}),
        borderColor: '#97C56A',
        borderWidth: 4,
        backgroundColor: '#97C56A',
        tension: 0,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#97C56A',
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
    labels: (data.distribucion_pago || []).map(item => item.nombre),
    datasets: [
      {
        data: (data.distribucion_pago || []).map(item => item.porcentaje),
        backgroundColor: ['#F1A139', '#4EACEC', '#97C56A', '#E73F3F'],
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
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Ventas Semanales</Title>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: 'none', height: '100%' }}>
            <Title level={4} style={{ marginBottom: '20px', fontWeight: 'bold' }}>Distribución de Métodos de Pago</Title>
            <div style={{ height: '250px' }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        
        <Col span={8} style={{ display: 'flex' }}>
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
              textAlign: 'center',
              padding: '10px 0' 
            }}
          >
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#888' }}>
              Precio Promedio por Producto
            </Text>
            <Title level={1} style={{ margin: '20px 0 10px 0', color: '#F1A139', fontWeight: 900, fontSize: '60px' }}>
              {formatK(data.precio_promedio_producto)}
            </Title>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#555' }}>
              MXN
            </Text>
          </Card>
        </Col>
        
        <Col span={8} style={{ display: 'flex' }}>
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
              textAlign: 'center',
              padding: '10px 0' 
            }}
          >
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#888' }}>
              Total Vendido en Periodo
            </Text>
            <Title level={1} style={{ margin: '20px 0 10px 0', color: '#97C56A', fontWeight: 900, fontSize: '60px' }}>
              {formatK(data.total_venta_periodo)}
            </Title>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#555' }}>
              MXN
            </Text>
          </Card>
        </Col>

        <Col span={8} style={{ display: 'flex' }}>
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
              textAlign: 'center',
              padding: '10px 0' 
            }}
          >
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#888' }}>
              Promedio de Venta por Pedido
            </Text>
            <Title level={1} style={{ margin: '20px 0 10px 0', color: '#4EACEC', fontWeight: 900, fontSize: '60px' }}>
              {formatK(data.promedio_venta_pedido)}
            </Title>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#555' }}>
              MXN
            </Text>
          </Card>
        </Col>

      </Row>

    </div>
  );
};

export default VentasGrafica;
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import useTokenValidation from "../hooks/useTokenValidation";

export default function HomePage() {
  const navigate = useNavigate();
  useTokenValidation();

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>
      <Row>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Agent Management</Card.Title>
              <Card.Text className="flex-grow-1">
                View, create, edit, and delete elevator agents.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate("/agents")}>
                Go to Agents
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Transactions</Card.Title>
              <Card.Text className="flex-grow-1">
                View and submit agent transactions.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate("/transactions")}>
                Go to Transactions
              </Button>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
}

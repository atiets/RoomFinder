import React from "react";
import { Modal, Button, Card } from "react-bootstrap";
import "./UpgradeModal.css";

const plans = [
  {
    title: "Gói 50K",
    price: "50.000đ",
    quota: "5 tin / 30 ngày",
    description: "Đăng thêm 5 tin trong vòng 30 ngày.",
  },
  {
    title: "Gói 100K",
    price: "100.000đ",
    quota: "Không giới hạn",
    description: "Đăng không giới hạn trong 30 ngày.",
  },
];

const UpgradeModal = ({ show, onHide, onUpgrade }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nâng cấp gói đăng tin</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex justify-content-around flex-wrap gap-3">
        {plans.map((plan, index) => (
          <Card key={index} style={{ width: "18rem" }} className="text-center">
            <Card.Body>
              <Card.Title>{plan.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {plan.price}
              </Card.Subtitle>
              <Card.Text>
                <strong>{plan.quota}</strong><br />
                {plan.description}
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => onUpgrade(plan.title)}
              >
                Chọn {plan.title}
              </Button>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default UpgradeModal;
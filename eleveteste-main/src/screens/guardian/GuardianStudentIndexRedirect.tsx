import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const GuardianStudentIndexRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();

  useEffect(() => {
    if (studentId) {
      navigate(`/app/guardian/students/${studentId}/calendar`, { replace: true });
    }
  }, [navigate, studentId]);

  return <p className="text-sm text-muted-foreground">Redirecionando...</p>;
};

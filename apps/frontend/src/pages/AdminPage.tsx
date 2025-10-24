import styled from 'styled-components';
import { Link } from 'react-router-dom';

const AdminWrapper = styled.div`
  padding: 20px;
  text-align: center;
`;

const AdminPage = () => {
  return (
    <AdminWrapper>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin! You are logged in.</p>
      {/* Add links to stay management later */}
      <Link to="/">Back to Map</Link>
    </AdminWrapper>
  );
};

export default AdminPage;
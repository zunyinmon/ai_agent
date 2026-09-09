import Header from './Header.jsx'
import AppDrawer from './AppDrawer.jsx'
import {useQuery} from '@tanstack/react-query'
import { Card, CardContent, Container } from '@mui/material';

// frondend and backend (index.ts to App.jsx connection)
async function fetchPosts() {
  // const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  // const data = await response.json();
  // return data;
   const res = await fetch('http://localhost:8800/posts');
   return res.json();
}

export default function App(){
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching posts: {isError.message}</div>;
  }

  return(
    <div>
      <Header />
      <AppDrawer />
      <Container>
        {posts?.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              {post.content}
            </CardContent>
          </Card>
        ))}
      </Container>
    </div>
  )
}
import { useEffect } from "react";
import { useQuery, useMutation } from "react-query";

async function fetchComments(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
  );
  return response.json();
}

async function deletePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    { method: "DELETE" }
  );
  return response.json();
}

async function updatePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    { method: "PATCH", data: { title: "REACT QUERY FOREVER!!!!" } }
  );
  return response.json();
}

export function PostDetail({ post }) {
  // replace with useQuery
  const { data, isLoading, isError } = useQuery(["comments", post.id], () =>
    fetchComments(post.id)
  );

  const deleteMutation = useMutation((postId) => deletePost(postId));

  const updateTitle = useMutation((postId) => updatePost(postId));

  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
      {deleteMutation.isError && <p style={{ color: "red" }}>isError</p>}
      {deleteMutation.isLoading && <p style={{ color: "red" }}>loading</p>}
      {deleteMutation.isSuccess && <p style={{ color: "green" }}>good</p>}
      <button onClick={() => updateTitle.mutate(post.id)}>Update title</button>
      <p>{post.body}</p>
      <h4>Comments</h4>
      {!isLoading &&
        data.map((comment) => (
          <li key={comment.id}>
            {comment.email}: {comment.body}
          </li>
        ))}
    </>
  );
}

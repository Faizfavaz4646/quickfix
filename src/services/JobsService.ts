import axios from "axios";
import { toast } from "sonner";
import { Job, User } from "@/types/user";

const API_URL = "http://localhost:50001";
const JOBS_ENDPOINT = `${API_URL}/jobs`;
const USERS_ENDPOINT = `${API_URL}/users`;

export type JobWithClientProfile = Job & {
  clientProfile?: User; // profilePic, state, city, district
};

/**
 * Post a new job
 */
export const postJob = async (
  job: Job,
  clientId: string | number
): Promise<boolean> => {
  try {
    const jobToPost: Job = {
      ...job,
      likes: job.likes || [],
      comments: job.comments || [],
    };

    await axios.post(JOBS_ENDPOINT, jobToPost);

    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);
    const clientPosts: Job[] = Array.isArray(client.posts) ? client.posts : [];

    await axios.patch(`${USERS_ENDPOINT}/${clientId}`, {
      posts: [...clientPosts, jobToPost],
    });

    toast.success("Job posted successfully!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to post job.");
    return false;
  }
};

/**
 * Fetch all jobs with client profile details
 */
export const fetchJobs = async (): Promise<JobWithClientProfile[]> => {
  try {
    const { data: jobs } = await axios.get<Job[]>(JOBS_ENDPOINT);

    const jobsWithProfiles: JobWithClientProfile[] = await Promise.all(
      jobs.map(async (job) => {
        try {
          const { data: client } = await axios.get(
            `${USERS_ENDPOINT}/${job.clientId}`
          );
          return {
            ...job,
            clientProfile: client.profile,
          };
        } catch {
          return { ...job };
        }
      })
    );

    return jobsWithProfiles;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch jobs.");
    return [];
  }
};

/**
 * Fetch jobs for workers
 */
export const fetchJobsForWorkers = async (
  status?: string
): Promise<JobWithClientProfile[]> => {
  const allJobs = await fetchJobs();
  if (status) return allJobs.filter((job) => job.status === status);
  return allJobs;
};

/**
 * Fetch jobs/posts for a specific client
 */
export const fetchClientPosts = async (
  clientId: string | number
): Promise<JobWithClientProfile[]> => {
  try {
    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);
    const posts: Job[] = Array.isArray(client.posts) ? client.posts : [];

    return posts.map((post) => ({
      ...post,
      clientProfile: client.profile,
    }));
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch client posts.");
    return [];
  }
};

/**
 * Like a job
 */
export const likeJob = async (
  jobId: string | number,
  userId: string | number
): Promise<boolean> => {
  try {
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
    const likes: string[] = Array.isArray(job.likes) ? job.likes : [];

    if (likes.includes(String(userId))) {
      toast.error("Already liked this job.");
      return false;
    }

    const updatedLikes = [...likes, String(userId)];
    await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { likes: updatedLikes });

    toast.success("Job liked!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to like job.");
    return false;
  }
};

/**
 * Add a comment to a job (with user info)
 */
export const commentOnJob = async (
  jobId: string | number,
  userId: string | number,
  text: string
): Promise<boolean> => {
  try {
    // Fetch job
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
    const comments: any[] = Array.isArray(job.comments) ? job.comments : [];

    // Fetch user details
    const { data: user } = await axios.get<User>(`${USERS_ENDPOINT}/${userId}`);

    const newComment = {
      id: Date.now().toString(),
      userId: String(userId),
      userName: user.name ?? "Unknown",
      profilePic: user.profilePic ?? "/default-avatar.png",
      text,
      date: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];

    await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, {
      comments: updatedComments,
    });

    toast.success("Comment added!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to add comment.");
    return false;
  }
};

/**
 * Unlike a job
 */
export const unlikeJob = async (
  jobId: string | number,
  userId: string | number
): Promise<boolean> => {
  try {
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
    const likes: string[] = Array.isArray(job.likes) ? job.likes : [];

    if (!likes.includes(String(userId))) {
      toast.error("You haven't liked this job yet.");
      return false;
    }

    const updatedLikes = likes.filter((id) => id !== String(userId));
    await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { likes: updatedLikes });

    toast.success("Like removed!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to remove like.");
    return false;
  }
};

/**
 * Delete a job (removes from jobs + client's posts)
 */
export const deleteJob = async (
  jobId: string | number,
  clientId: string | number
): Promise<boolean> => {
  try {
    await axios.delete(`${JOBS_ENDPOINT}/${jobId}`);

    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);
    const clientPosts: Job[] = Array.isArray(client.posts) ? client.posts : [];

    const updatedPosts = clientPosts.filter((p) => p.id !== jobId);
    await axios.patch(`${USERS_ENDPOINT}/${clientId}`, { posts: updatedPosts });

    toast.success("Job deleted successfully!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete job.");
    return false;
  }
};
// ✅ Delete comment (by rewriting comments array)
export const deleteComment = async (
  jobId: string | number,
  commentId: string | number
) => {
  const { data: job } = await axios.get<Job>(`${API_URL}/jobs/${jobId}`);

  // ✅ safe fallback to []
  const updatedComments = (job.comments ?? []).filter(
    (c) => c.id !== commentId
  );

  const { data: updatedJob } = await axios.patch<Job>(
    `${API_URL}/jobs/${jobId}`,
    { comments: updatedComments }
  );

  return updatedJob;
};

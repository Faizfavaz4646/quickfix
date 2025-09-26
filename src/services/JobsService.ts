import axios from "axios";
import { toast } from "sonner";
import { Job, User } from "@/types/user";

const API_URL = "http://localhost:50001";
const JOBS_ENDPOINT = `${API_URL}/jobs`;
const USERS_ENDPOINT = `${API_URL}/users`;
const WORKERS_ENDPOINT = `${API_URL}/workers`;

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
      id: Date.now().toString(),
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
 * Fetch jobs for workers (optional filtering by status)
 */
export const fetchJobsForWorkers = async (
  status?: string
): Promise<JobWithClientProfile[]> => {
  const allJobs = await fetchJobs();
  if (status) return allJobs.filter((job) => job.status === status);
  return allJobs;
};

/**
 * Fetch posts for a specific client
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
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);
    const likes: string[] = Array.isArray(job.likes) ? job.likes : [];

    if (likes.includes(String(userId))) {
      toast.error("Already liked this job.");
      return false;
    }

    const updatedLikes = [...likes, String(userId)];
    await axios.patch(`${JOBS_ENDPOINT}/${jobIdStr}`, { likes: updatedLikes });

    toast.success("Job liked!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to like job.");
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
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);
    const likes: string[] = Array.isArray(job.likes) ? job.likes : [];

    if (!likes.includes(String(userId))) {
      toast.error("You haven't liked this job yet.");
      return false;
    }

    const updatedLikes = likes.filter((id) => id !== String(userId));
    await axios.patch(`${JOBS_ENDPOINT}/${jobIdStr}`, { likes: updatedLikes });

    toast.success("Like removed!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to remove like.");
    return false;
  }
};

/**
 * Add a comment to a job (checks both users & workers for profilePic)
 */
export const commentOnJob = async (
  jobId: string | number,
  userId: string | number,
  text: string
): Promise<boolean> => {
  try {
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);
    const comments: any[] = Array.isArray(job.comments) ? job.comments : [];

    // 🟢 Only save userId + text (not profilePic / userName)
    const newComment = {
      id: Date.now().toString(),
      userId: String(userId),
      text,
      date: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    await axios.patch(`${JOBS_ENDPOINT}/${jobIdStr}`, { comments: updatedComments });

    console.log("Comment added successfully:", newComment);
    toast.success("Comment added!");
    return true;
  } catch (error) {
    console.error("Failed to add comment:", error);
    toast.error("Failed to add comment.");
    return false;
  }
};



/**
 * Delete a comment (any user)
 */
export const deleteComment = async (
  jobId: string | number,
  commentId: string | number
) => {
  try {
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);
    const updatedComments = (job.comments ?? []).filter((c) => c.id !== String(commentId));

    const { data: updatedJob } = await axios.patch<Job>(
      `${JOBS_ENDPOINT}/${jobIdStr}`,
      { comments: updatedComments }
    );

    toast.success("Comment deleted!");
    return updatedJob;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete comment.");
    return null;
  }
};

/**
 * Delete a comment by client on their own post
 */
export const deleteCommentByClient = async (
  jobId: string | number,
  commentId: string | number,
  clientId: string | number
) => {
  try {
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);

    if (job.clientId !== String(clientId)) {
      toast.error("You can only delete comments on your own posts.");
      return null;
    }

    const updatedComments = (job.comments ?? []).filter((c) => c.id !== String(commentId));
    const { data: updatedJob } = await axios.patch<Job>(
      `${JOBS_ENDPOINT}/${jobIdStr}`,
      { comments: updatedComments }
    );

    toast.success("Comment deleted!");
    return updatedJob;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete comment.");
    return null;
  }
};

/**
 * Delete a job (any client)
 */
export const deleteJob = async (
  jobId: string | number,
  clientId: string | number
): Promise<boolean> => {
  try {
    const jobIdStr = String(jobId);
    await axios.delete(`${JOBS_ENDPOINT}/${jobIdStr}`);

    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);
    const clientPosts: Job[] = Array.isArray(client.posts) ? client.posts : [];
    const updatedPosts = clientPosts.filter((p) => String(p.id) !== jobIdStr);

    await axios.patch(`${USERS_ENDPOINT}/${clientId}`, { posts: updatedPosts });

    toast.success("Job deleted successfully!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete job.");
    return false;
  }
};

/**
 * Delete a client’s own post
 */
export const deleteClientPost = async (
  jobId: string | number,
  clientId: string | number
): Promise<boolean> => {
  try {
    const jobIdStr = String(jobId);
    const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobIdStr}`);

    if (job.clientId !== String(clientId)) {
      toast.error("You can only delete your own posts.");
      return false;
    }

    await axios.delete(`${JOBS_ENDPOINT}/${jobIdStr}`);

    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);
    const clientPosts: Job[] = Array.isArray(client.posts) ? client.posts : [];
    const updatedPosts = clientPosts.filter((p) => String(p.id) !== jobIdStr);

    await axios.patch(`${USERS_ENDPOINT}/${clientId}`, { posts: updatedPosts });

    toast.success("Post deleted successfully!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete post.");
    return false;
  }
};

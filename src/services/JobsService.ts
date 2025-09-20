import axios from "axios";
import { toast } from "sonner";
import { Job, User} from "@/types/user";

const API_URL = "http://localhost:50001";
const JOBS_ENDPOINT = `${API_URL}/jobs`;
const USERS_ENDPOINT = `${API_URL}/users`;

export type JobWithClientProfile = Job & {
  clientProfile?: User; // profilePic, state, city, district
};

/**
 * Post a new job:
 * - Add to main jobs array
 * - Add to client's own posts array (create if missing)
 */
export const postJob = async (
  job: Job,
  clientId: string | number
): Promise<boolean> => {
  try {
    // Ensure job has default likes/comments arrays
    const jobToPost: Job = {
      ...job,
      likes: job.likes || [],
      comments: job.comments || [],
    };

    // Add job to main jobs array
    await axios.post(JOBS_ENDPOINT, jobToPost);

    // Fetch client's data
    const { data: client } = await axios.get(`${USERS_ENDPOINT}/${clientId}`);

    // Ensure client has a posts array
    const clientPosts: Job[] = Array.isArray(client.posts) ? client.posts : [];

    // Add job to client's posts
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
 * Fetch all jobs
 */
export const fetchJobs = async (): Promise<JobWithClientProfile[]> => {
  try {
    const { data: jobs } = await axios.get<Job[]>(JOBS_ENDPOINT);

    // Fetch client profiles for each job
    const jobsWithProfiles: JobWithClientProfile[] = await Promise.all(
      jobs.map(async (job) => {
        try {
          const { data: client } = await axios.get(`${USERS_ENDPOINT}/${job.clientId}`);
          return {
            ...job,
            clientProfile: client.profile, // profilePic, state, city, district
          };
        } catch {
          return { ...job }; // fallback if client fetch fails
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
 * Fetch jobs specifically for workers
 * Optionally filter by status (pending/ongoing/completed)
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

    // Attach client profile to each post
    const postsWithProfile: JobWithClientProfile[] = posts.map((post) => ({
      ...post,
      clientProfile: client.profile,
    }));

    return postsWithProfile;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch client posts.");
    return [];
  }
};

// import axios from "axios";
// import { toast } from "sonner";
// import { Job, Profile } from "@/types/user";
// import { API_URL } from "@/lib/constants";


// const JOBS_ENDPOINT = `${API_URL}/jobs`;
// const USERS_ENDPOINT = `${API_URL}/users`;

// export type JobWithClientProfile = Job & {
//   clientProfile?: Profile; // profilePic, state, city, district
// };

// /**
//  * Post a new job
//  */
// export const postJob = async (job: Job): Promise<Job | null> => {
//   try {
//     const jobToPost: Job = {
//       ...job,
//       _id: job._id || new Date().getTime().toString(), // temporary ID if not provided
//       likes: job.likes ?? [],
//       comments: job.comments ?? [],
//     };

//     const { data: createdJob } = await axios.post<Job>(JOBS_ENDPOINT, jobToPost);
//     toast.success("Job posted successfully!");
//     return createdJob;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to post job.");
//     return null;
//   }
// };

// /**
//  * Fetch all jobs with client profile
//  */
// export const fetchJobs = async (): Promise<JobWithClientProfile[]> => {
//   try {
//     const { data: jobs } = await axios.get<Job[]>(JOBS_ENDPOINT);

//     const jobsWithProfiles: JobWithClientProfile[] = await Promise.all(
//       jobs.map(async (job) => {
//         try {
//           const { data: client } = await axios.get(`${USERS_ENDPOINT}/${job.clientId}`);
//           return {
//             ...job,
//             clientProfile: client.profile, // use Profile type
//           };
//         } catch {
//           return job;
//         }
//       })
//     );

//     return jobsWithProfiles;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to fetch jobs.");
//     return [];
//   }
// };

// /**
//  * Like a job
//  */
// export const likeJob = async (jobId: string, userId: string): Promise<boolean> => {
//   try {
//     const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
//     const likes = job.likes ?? [];

//     if (likes.includes(userId)) {
//       toast.error("Already liked this job.");
//       return false;
//     }

//     await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { likes: [...likes, userId] });
//     toast.success("Job liked!");
//     return true;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to like job.");
//     return false;
//   }
// };

// /**
//  * Unlike a job
//  */
// export const unlikeJob = async (jobId: string, userId: string): Promise<boolean> => {
//   try {
//     const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
//     const likes = job.likes ?? [];

//     if (!likes.includes(userId)) {
//       toast.error("You haven't liked this job yet.");
//       return false;
//     }

//     await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { likes: likes.filter((id) => id !== userId) });
//     toast.success("Like removed!");
//     return true;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to remove like.");
//     return false;
//   }
// };

// /**
//  * Add a comment to a job
//  */
// export const commentOnJob = async (jobId: string, userId: string, text: string): Promise<boolean> => {
//   try {
//     const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
//     const comments = job.comments ?? [];

//     const newComment = {
//       _id: new Date().getTime().toString(),
//       userId,
//       text,
//       date: new Date().toISOString(),
//     };

//     await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { comments: [...comments, newComment] });
//     toast.success("Comment added!");
//     return true;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to add comment.");
//     return false;
//   }
// };

// /**
//  * Delete a comment
//  */
// export const deleteComment = async (jobId: string, commentId: string): Promise<boolean> => {
//   try {
//     const { data: job } = await axios.get<Job>(`${JOBS_ENDPOINT}/${jobId}`);
//     const updatedComments = (job.comments ?? []).filter((c) => c._id !== commentId);

//     await axios.patch(`${JOBS_ENDPOINT}/${jobId}`, { comments: updatedComments });
//     toast.success("Comment deleted!");
//     return true;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to delete comment.");
//     return false;
//   }
// };

// /**
//  * Delete a job
//  */
// export const deleteJob = async (jobId: string): Promise<boolean> => {
//   try {
//     await axios.delete(`${JOBS_ENDPOINT}/${jobId}`);
//     toast.success("Job deleted successfully!");
//     return true;
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to delete job.");
//     return false;
//   }
// };

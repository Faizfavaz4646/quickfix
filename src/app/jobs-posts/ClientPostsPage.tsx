// "use client";

// import { useEffect, useState, useRef } from "react";
// import { FaThumbsUp } from "react-icons/fa";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { TfiReload } from "react-icons/tfi";
// import { useAuthStore } from "@/store/authStore";
// import {
//   fetchJobs,
//   likeJob,
//   unlikeJob,
//   commentOnJob,
//   deleteComment,
//   deleteJob,
// } from "@/services/JobsService";
// import { Job, Comment } from "@/types/user";
// import { JobWithClientProfile as ServiceJob } from "@/services/JobsService";

// // Component-friendly type
// export type JobWithClientProfile = Job & {
//   clientProfile?: {
//     profilePic?: string;
//   };
// };

// export default function ClientPostsPage() {
//   const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
//   const [visibleCount, setVisibleCount] = useState(3);
//   const [loading, setLoading] = useState(true);
//   const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

//   const modalRef = useRef<HTMLDivElement>(null);
//   const { user } = useAuthStore();
//   const currentUserId = user?._id ?? "";

//   // Fetch jobs
//   useEffect(() => {
//     const loadJobs = async () => {
//       setLoading(true);
//       try {
//         const data = await fetchJobs(); // Service type with Profile
//         // Map to component type with only necessary clientProfile fields
//         const mappedJobs: JobWithClientProfile[] = data.map((job) => ({
//           ...job,
//           clientProfile: {
//             profilePic: job.clientProfile?.profilePic ?? "/default-avatar.png",
//           },
//         }));
//         setJobs(mappedJobs.reverse());
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadJobs();
//   }, []);

//   // Close modal on outside click
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent | TouchEvent) => {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
//         setModalOpen(false);
//         setSelectedJobId(null);
//       }
//     };
//     if (modalOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("touchstart", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("touchstart", handleClickOutside);
//     };
//   }, [modalOpen]);

//   const getProfilePic = (profile?: { profilePic?: string }) => {
//     return profile?.profilePic ?? "/default-avatar.png";
//   };

//   const handleLike = async (jobId: string) => {
//     if (!currentUserId) return;
//     const job = jobs.find((j) => j._id === jobId);
//     if (!job?._id) return;

//     const hasLiked = job.likes?.includes(currentUserId) ?? false;
//     const success = hasLiked
//       ? await unlikeJob(job._id, currentUserId)
//       : await likeJob(job._id, currentUserId);

//     if (success) {
//       setJobs((prev) =>
//         prev.map((j) =>
//           j._id === job._id
//             ? {
//                 ...j,
//                 likes: hasLiked
//                   ? j.likes?.filter((id) => id !== currentUserId) ?? []
//                   : [...(j.likes ?? []), currentUserId],
//               }
//             : j
//         )
//       );
//     }
//   };

//   const handleComment = async (jobId: string, text: string) => {
//     if (!currentUserId || !text) return;
//     const job = jobs.find((j) => j._id === jobId);
//     if (!job?._id) return;

//     const success = await commentOnJob(job._id, currentUserId, text);
//     if (!success) return;

//     const newComment: Comment = {
//   _id: Date.now().toString(),
//   userId: currentUserId,
//   userName: user?.name ?? "Unknown",
//   text,
//   date: new Date().toISOString(),
//   profilePic: getProfilePic(user?.profile),
// };

//     setJobs((prev) =>
//       prev.map((j) =>
//         j._id === job._id ? { ...j, comments: [...(j.comments ?? []), newComment] } : j
//       )
//     );

//     setCommentInputs((prev) => ({ ...prev, [jobId]: "" }));
//   };

//   const handleDeleteComment = async (jobId: string, commentId: string) => {
//     if (!currentUserId || !confirm("Delete comment?")) return;
//     const job = jobs.find((j) => j._id === jobId);
//     if (!job?._id) return;

//     const success = await deleteComment(job._id, commentId);
//     if (success) {
//       setJobs((prev) =>
//         prev.map((j) =>
//           j._id === job._id ? { ...j, comments: job.comments?.filter((c) => c._id !== commentId) ?? [] } : j
//         )
//       );
//     }
//   };

//   const handleDeletePost = async (jobId: string) => {
//     if (!currentUserId || !confirm("Delete post?")) return;
//     const job = jobs.find((j) => j._id === jobId);
//     if (!job?._id) return;

//     const success = await deleteJob(job._id);
//     if (success) setJobs((prev) => prev.filter((j) => j._id !== job._id));
//   };

//   const selectedJobComments =
//     selectedJobId !== null ? jobs.find((j) => j._id === selectedJobId)?.comments ?? [] : [];

//   if (loading) return <div className="p-6 text-center w-full">Loading posts...</div>;
//   if (jobs.length === 0) return <div className="p-6 text-center w-full">No posts available</div>;

//   return (
//     <div className="w-full min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-4 space-y-6 relative">
//         {jobs.slice(0, visibleCount).map((job) => {
//           const isOwnPost = job.clientId === currentUserId;
//           const lastComment = job.comments?.at(-1);

//           return (
//             <div key={job._id} className="w-full rounded-lg shadow bg-white hover:shadow-lg transition p-4 relative">
//               <div className="flex justify-between items-center mb-3">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={getProfilePic(job.clientProfile)}
//                     alt={job.clientName}
//                     className="w-12 h-12 rounded-full border object-cover"
//                   />
//                   <p className="font-medium">{job.clientName}</p>
//                 </div>
//                 {isOwnPost && (
//                   <details className="relative">
//                     <summary className="list-none cursor-pointer">
//                       <BsThreeDotsVertical />
//                     </summary>
//                     <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow">
//                       <button
//                         onClick={() => handleDeletePost(job._id!)}
//                         className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100"
//                       >
//                         Delete Post
//                       </button>
//                     </div>
//                   </details>
//                 )}
//               </div>

//               <p className="mb-3 whitespace-pre-line">{job.description}</p>

//               {job.images?.length && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
//                   {job.images.map((img, idx) => (
//                     <img
//                       key={idx}
//                       src={img}
//                       alt={`Job ${idx + 1}`}
//                       className="w-full h-48 object-cover rounded-lg"
//                     />
//                   ))}
//                 </div>
//               )}

//               <p className="text-sm text-gray-500 mb-1">
//                 {job.likes?.length ? `${job.likes.length} likes` : "No likes yet"}
//               </p>

//               <div className="flex gap-4 pt-2">
//                 <button
//                   onClick={() => handleLike(job._id!)}
//                   className={`flex items-center gap-1 text-sm font-medium ${
//                     job.likes?.includes(currentUserId) ? "text-blue-500" : "text-gray-600"
//                   }`}
//                 >
//                   <FaThumbsUp /> Like
//                 </button>
//               </div>

//               {lastComment && (
//                 <div className="flex items-start gap-2 mt-3">
//                   <img
//                     src={getProfilePic(job.clientProfile)}
//                     alt={lastComment.userName}
//                     className="w-8 h-8 rounded-full border object-cover mt-1"
//                   />
//                   <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1">
//                     <span className="font-medium">{lastComment.userName}: </span>
//                     {lastComment.text}
//                     {job.comments?.length! > 1 && (
//                       <span className="text-gray-500 ml-2 text-xs">
//                         View all {job.comments?.length} comments
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-center gap-2 mt-2">
//                 <input
//                   type="text"
//                   placeholder="Write a comment..."
//                   value={commentInputs[job._id!] ?? ""}
//                   onChange={(e) =>
//                     setCommentInputs((prev) => ({ ...prev, [job._id!]: e.target.value }))
//                   }
//                   className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
//                 />
//                 <button
//                   onClick={() => handleComment(job._id!, commentInputs[job._id!] ?? "")}
//                   className="text-blue-500 font-medium text-sm"
//                 >
//                   Post
//                 </button>
//               </div>

//               {modalOpen && selectedJobId === job._id && (
//                 <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//                   <div
//                     ref={modalRef}
//                     className="bg-white w-full max-w-md max-h-[70vh] rounded-lg shadow-lg overflow-y-auto p-4"
//                   >
//                     <h3 className="text-sm font-medium mb-3">All Comments</h3>
//                     {selectedJobComments.length === 0 && (
//                       <p className="text-xs text-gray-500">No comments yet</p>
//                     )}
//                     {selectedJobComments.map((comment) => {
//                       const canDelete = comment.userId === currentUserId;
//                       return (
//                         <div key={comment._id} className="flex items-start gap-2 mb-2">
//                           <img
//                             src={getProfilePic(job.clientProfile)}
//                             alt={comment.userName}
//                             className="w-6 h-6 rounded-full border object-cover mt-1"
//                           />
//                           <div className="flex-1 text-xs bg-gray-100 rounded-lg px-2 py-1 relative">
//                             <span className="font-medium">{comment.userName}: </span>
//                             {comment.text}
//                             {canDelete && (
//                               <button
//                                 onClick={() => handleDeleteComment(selectedJobId, comment._id!)}
//                                 className="absolute top-0 right-0 text-red-500 text-xs"
//                               >
//                                 ×
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {visibleCount < jobs.length && (
//           <div className="text-center">
//             <button
//               onClick={() => setVisibleCount((prev) => prev + 3)}
//               className="text-gray-600 font-medium cursor-pointer"
//             >
//               <span className="flex gap-2">
//                 Load more <TfiReload className="mt-1" />
//               </span>
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

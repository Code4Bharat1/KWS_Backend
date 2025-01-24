import { Router } from 'express';
import { getProfile, editProfile,getProfileAllDetails ,getPendingUpdateRequests,createUpdateRequest,approveUpdateRequest} from '../controllers/profileController.js';
import {uploadFiles } from '../middleware/fileUpload.js';
const router = Router();




router.get('/getprofile/:user_id',getProfile);
router.put('/editprofile/:user_id',uploadFiles, editProfile);



  router.get('/get/:user_id',getProfileAllDetails);


  router.post('/update-request', createUpdateRequest);

  router.get("/pending-updates", getPendingUpdateRequests);


  router.post("/approve", approveUpdateRequest);





export default router;
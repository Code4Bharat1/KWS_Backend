import argon2 from 'argon2'; // Import the Argon2 library



// Example hash from pgAdmin
const hashFromDB = "argon2$argon2id$argon2$argon2id$v=19$m=102400,t=2,p=8$QklZTXB1dm9VTzJLVWNVMXVMOTJtMQ$jYOzF8umJM0TAoK1Ndco0fJzQt05mIjbhuiu8EbWy/o=19$m=102400,t=2,p=8$QklZTXB1dm9VTzJLVWNVMXVMOTJtMQ$jYOzF8umJM0TAoK1Ndco0fJzQt05mIjbhuiu8EbWy/o"
const plainPassword = "Mud@ssirs472"; // Plain password provided by user

(async () => {
  try {
    // Verify if the plaintext password matches the stored hash
    const isMatch = await argon2.verify(hashFromDB, plainPassword);
    console.log('Password match:', isMatch); // Expected: true
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
})();

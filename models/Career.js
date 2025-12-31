import mongoose from 'mongoose'

const careerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  passingYear: {
    type: String,
    required: true
  },
  majorSkill: {
    type: String,
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Digital Marketing',
      'Cloud Services',
      'Data Analysis',
      'DevOps',
      'Quality Assurance'
    ]
  },
  passportPhoto: {
    type: {
      data: Buffer,
      contentType: String,
      fileName: String
    },
    required: true
  },
  resume: {
    type: {
      data: Buffer,
      contentType: String,
      fileName: String
    },
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
})

const Career = mongoose.model('Career', careerSchema)
export default Career

import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import Career from '../models/Career.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true)
      } else {
        cb(new Error('Resume must be PDF format'))
      }
    } else if (file.fieldname === 'passportPhoto') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(new Error('Photo must be an image'))
      }
    } else {
      cb(null, true)
    }
  }
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

// Apply for career
router.post('/apply', upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, contactNumber, course, passingYear, majorSkill } = req.body

    if (!name || !email || !contactNumber || !course || !passingYear || !majorSkill) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!req.files?.passportPhoto || !req.files?.resume) {
      return res.status(400).json({ message: 'Both photo and resume are required' })
    }

    const passportPhotoData = {
      data: req.files.passportPhoto[0].buffer,
      contentType: req.files.passportPhoto[0].mimetype,
      fileName: req.files.passportPhoto[0].originalname
    }

    const resumeData = {
      data: req.files.resume[0].buffer,
      contentType: req.files.resume[0].mimetype,
      fileName: req.files.resume[0].originalname
    }

    const careerApplication = new Career({
      name,
      email,
      contactNumber,
      course,
      passingYear,
      majorSkill,
      passportPhoto: passportPhotoData,
      resume: resumeData,
      appliedAt: new Date()
    })

    const savedApplication = await careerApplication.save()

    // Send emails asynchronously (non-blocking) - errors won't affect form submission
    setImmediate(async () => {
      try {
        const applicantEmailContent = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0066cc;">Thank you for applying!</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We have received your application for the position at <strong>Arutis Technologies</strong>.</p>
            <p>Your application ID is: <strong>${savedApplication._id}</strong></p>
            <p>Our team will review your application and contact you shortly if there's a match.</p>
            <br>
            <p>Best regards,<br><strong>Arutis Technologies Team</strong></p>
          </div>
        `

        if (transporter && process.env.SMTP_HOST) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Application Received - Arutis Technologies',
            html: applicantEmailContent
          })
          console.log('Applicant email sent successfully')
        }
      } catch (emailError) {
        console.warn('Failed to send applicant email:', emailError.message)
      }

      try {
        const hrEmailContent = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0066cc;">New Career Application Received</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Contact:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${contactNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Course:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${course}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Passing Year:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${passingYear}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Major Skill:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${majorSkill}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Application ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${savedApplication._id}</strong></td>
              </tr>
            </table>
          </div>
        `

        if (transporter && process.env.HR_EMAIL && process.env.SMTP_HOST) {
          const attachments = [
            {
              filename: passportPhotoData.fileName,
              content: passportPhotoData.data,
              contentType: passportPhotoData.contentType
            },
            {
              filename: resumeData.fileName,
              content: resumeData.data,
              contentType: resumeData.contentType
            }
          ]

          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: process.env.HR_EMAIL,
            subject: `New Career Application - ${name}`,
            html: hrEmailContent,
            attachments: attachments
          })
          console.log('HR email sent successfully')
        }
      } catch (emailError) {
        console.warn('Failed to send HR email:', emailError.message)
      }
    })

    // Respond immediately with success - emails are sent in background
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId: savedApplication._id
    })

  } catch (error) {
    console.error('Error submitting application:', error)
    res.status(500).json({
      message: 'Error submitting application: ' + error.message
    })
  }
})

// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Career.find()
      .select('-passportPhoto.data -resume.data')
      .sort({ appliedAt: -1 })
    
    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await Career.findById(req.params.id)
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }
    res.json(application)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Download resume
router.get('/applications/:id/resume', async (req, res) => {
  try {
    const application = await Career.findById(req.params.id)
    if (!application || !application.resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    res.contentType(application.resume.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${application.resume.fileName}"`)
    res.send(application.resume.data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Download photo
router.get('/applications/:id/photo', async (req, res) => {
  try {
    const application = await Career.findById(req.params.id)
    if (!application || !application.passportPhoto) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    res.contentType(application.passportPhoto.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${application.passportPhoto.fileName}"`)
    res.send(application.passportPhoto.data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update application status
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body

    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const application = await Career.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).select('-passportPhoto.data -resume.data')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.json(application)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

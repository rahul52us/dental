import * as yup from 'yup'

const testimonialValidation = yup.object({
 name : yup.string().min(2,'name should be atleast of 2 character').max(80,'name should not be greater than 80 character').trim(),
 profession : yup.string(),
 rating : yup.number().min(1,'Rating must be Minium 1').max(5,'Raitng can not greater than 5').typeError('rating is required'),
 description : yup.string()
})

export default testimonialValidation;
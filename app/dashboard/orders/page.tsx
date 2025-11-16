'use client'
import React from 'react'
import LineItems from '../labs/component/LineItems/LineItems'
import stores from '../../store/stores'
import { toJS } from 'mobx'

const page = () => {
  const {auth : {userType, user}} = stores

  console.log(toJS(userType))

  return (
    <LineItems data={{patientData : {_id : user?._id}, isPatient : true} } />
  )
}

export default page
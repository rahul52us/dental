export const statusCode = {
    info : 300
}

export const getStatusType = (code : string) => {
    if(Number(code) === statusCode.info){
        return 'info'
    }
    else {
        return 'error'
    }
}

export const copyToClipboard = (text: string) => {
  if (!text || text === "--") return;
  navigator.clipboard.writeText(text)
    .then(() => {
      alert(`copied ---- ${text}`)
    })
};


export function replaceLabelValueObjects(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => replaceLabelValueObjects(item));
    } else if (obj !== null && typeof obj === 'object') {
      // Check if it's exactly a { label, value } object
      const keys = Object.keys(obj);
      // Check if it's a { label, value } object or a rich user object from search
      if (
        keys.includes('label') &&
        (keys.includes('value') || keys.includes('_id'))
      ) {
        return obj.value || obj._id;
      }

      // Otherwise, recursively process the object
      const newObj: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = replaceLabelValueObjects(obj[key]);
        }
      }
      return newObj;
    }

    return obj; // Return primitive value as-is
  }

export const calculateAgeSafe = (dob?: string) => {
  if (!dob || typeof dob !== "string") return null;

  const birthDate = new Date(dob + "T00:00:00"); // timezone-safe
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();

  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0 || age > 150) return null;

  return age; // 👈 can be 0
};
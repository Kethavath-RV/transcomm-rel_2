// Iterates through the updated object fields and assigns them to the current object if they exist, recursively
export function nested_object_assign (current: any, updated: any): any {
    Object.keys(updated).forEach(key => {
      const current_val = current[key]
      const updated_val = updated[key]
      if(updated_val && current_val && typeof updated_val === 'object' && typeof current_val === 'object'){
        current[key] = nested_object_assign(updated_val, current_val)
      } else {
        current[key] = updated[key]
      }
    })
  return current
}
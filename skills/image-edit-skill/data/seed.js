function seedData(params) {
  const { originalImage, editDescription } = params
  return {
    originalImage: originalImage || 'https://picsum.photos/seed/edit_origin/512/512',
    editDescription,
    editedFileID: '',
    editedTempUrl: `https://picsum.photos/seed/edited_${Date.now()}/512/512`
  }
}

module.exports = { seedData }

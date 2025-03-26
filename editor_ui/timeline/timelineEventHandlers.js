/**
 * timelineEventHandlers.js
 *
 * Contains JavaScript event handlers for the Timeline tab.
 */

/**
 * Returns the JavaScript event handlers for the Timeline tab
 * @returns {string} JavaScript code as a string
 */
function getTimelineEventHandlers() {
    return `
        // Segment operations
        function openAddSegmentModal() {
            // Reset the form
            document.getElementById('segment-form').reset();
            document.getElementById('segment-sequence').value = '';
            document.getElementById('segment-modal-title').textContent = 'Add Segment';
            
            // Show the modal
            document.getElementById('segment-modal').style.display = 'block';
        }
        
        function editSegment(segmentSequence) {
            // Get the segment data from the parent window
            window.parent.postMessage({
                type: 'get-segment-data',
                segmentSequence: segmentSequence
            }, '*');
        }
        
        function deleteSegment(segmentSequence) {
            if (confirm('Are you sure you want to delete this segment? This will delete all scenes and clips within the segment.')) {
                // Send a message to the parent window to handle the delete
                window.parent.postMessage({
                    type: 'delete-segment',
                    segmentSequence: segmentSequence
                }, '*');
            }
        }
        
        function submitSegmentForm(form) {
            const formData = new FormData(form);
            const segmentData = {};
            
            // Convert form data to object
            for (const [key, value] of formData.entries()) {
                segmentData[key] = value;
            }
            
            // Determine if this is an add or update operation
            const isUpdate = segmentData.segmentSequence !== '';
            
            // Send the segment data to the parent window
            window.parent.postMessage({
                type: isUpdate ? 'update-segment' : 'add-segment',
                segmentData: segmentData
            }, '*');
            
            // Close the modal
            document.getElementById('segment-modal').style.display = 'none';
            
            // Prevent form submission
            return false;
        }
        
        function closeSegmentModal() {
            document.getElementById('segment-modal').style.display = 'none';
        }
        
        function populateSegmentForm(segmentData) {
            // Set the form title
            document.getElementById('segment-modal-title').textContent = 'Edit Segment';
            
            // Set form fields
            document.getElementById('segment-sequence').value = segmentData.segmentSequence;
            document.getElementById('segment-title').value = segmentData.title || '';
            document.getElementById('min-length').value = segmentData.minLength || 0;
            document.getElementById('max-length').value = segmentData.maxLength || 0;
            
            // Show the modal
            document.getElementById('segment-modal').style.display = 'block';
        }
        function renderSegment(segmentSequence) {
            // Send a message to the parent window to handle the render
            window.parent.postMessage({
                type: 'render-segment',
                segmentSequence: segmentSequence
            }, '*');
        }
        
        function renderScene(segmentSequence, sceneSequence) {
            // Send a message to the parent window to handle the render
            window.parent.postMessage({
                type: 'render-scene',
                segmentSequence: segmentSequence,
                sceneSequence: sceneSequence
            }, '*');
        }
        
        function editClip(segmentSequence, sceneSequence, clipSequence, clipType) {
            // Get the clip data from the parent window
            window.parent.postMessage({
                type: 'get-clip-data',
                segmentSequence: segmentSequence,
                sceneSequence: sceneSequence,
                clipSequence: clipSequence,
                clipType: clipType
            }, '*');
        }
        
        function deleteClip(segmentSequence, sceneSequence, clipSequence, clipType) {
            if (confirm('Are you sure you want to delete this clip?')) {
                // Send a message to the parent window to handle the delete
                window.parent.postMessage({
                    type: 'delete-clip',
                    segmentSequence: segmentSequence,
                    sceneSequence: sceneSequence,
                    clipSequence: clipSequence,
                    clipType: clipType
                }, '*');
            }
        }
        
        // Function to handle clip edit form submission
        function submitClipEdit(form) {
            const formData = new FormData(form);
            const clipData = {};
            
            // Convert form data to object
            for (const [key, value] of formData.entries()) {
                clipData[key] = value;
            }
            
            // Get the clip path and comments based on the clip type
            const clipType = clipData.clipType;
            if (clipType === 'video') {
                clipData.clipPath = document.getElementById('clip-path').value;
                clipData.comments = document.getElementById('comments').value;
            } else if (clipType === 'image') {
                clipData.clipPath = document.getElementById('image-path').value;
                clipData.comments = document.getElementById('image-comments').value;
            }
            
            // Send the updated clip data to the parent window
            window.parent.postMessage({
                type: 'update-clip',
                clipData: clipData
            }, '*');
            
            // Close the modal
            document.getElementById('edit-clip-modal').style.display = 'none';
            
            // Prevent form submission
            return false;
        }
        
        // Function to open a file dialog to select a new clip path
        function openFileDialog() {
            // Send a message to the parent window to open a file dialog
            window.parent.postMessage({
                type: 'open-file-dialog',
                segmentSequence: document.getElementById('segment-sequence').value,
                sceneSequence: document.getElementById('scene-sequence').value,
                clipSequence: document.getElementById('clip-sequence').value,
                clipType: document.getElementById('clip-type').value
            }, '*');
        }
        
        // Function to populate the edit form with clip data
        function populateEditForm(clipData) {
            const form = document.getElementById('edit-clip-form');
            
            // Set hidden fields
            document.getElementById('segment-sequence').value = clipData.segmentSequence;
            document.getElementById('scene-sequence').value = clipData.sceneSequence;
            document.getElementById('clip-sequence').value = clipData.clipSequence;
            document.getElementById('clip-type').value = clipData.clipType;
            
            // Set visible fields based on clip type
            if (clipData.clipType === 'video') {
                document.getElementById('clip-path').value = clipData.clipPath || '';
                document.getElementById('trim-start-minutes').value = clipData.trimStartMinutes || 0;
                document.getElementById('trim-start-seconds').value = clipData.trimStartSeconds || 0;
                document.getElementById('trim-end-minutes').value = clipData.trimEndMinutes || 0;
                document.getElementById('trim-end-seconds').value = clipData.trimEndSeconds || 0;
                document.getElementById('comments').value = clipData.comments || '';
                
                // Show video-specific fields
                document.getElementById('video-fields').style.display = 'block';
                document.getElementById('image-fields').style.display = 'none';
            } else if (clipData.clipType === 'image') {
                document.getElementById('image-path').value = clipData.clipPath || '';
                document.getElementById('duration-seconds').value = clipData.durationSeconds || 0;
                document.getElementById('image-comments').value = clipData.comments || '';
                
                // Show image-specific fields
                document.getElementById('video-fields').style.display = 'none';
                document.getElementById('image-fields').style.display = 'block';
            }
            
            // Show the modal
            document.getElementById('edit-clip-modal').style.display = 'block';
        }
        
        // Function to close the modal
        function closeModal() {
            document.getElementById('edit-clip-modal').style.display = 'none';
        }
        
        // Function to move a clip up in sequence
        function moveClipUp(segmentSequence, sceneSequence, clipSequence, clipType) {
            // Send a message to the parent window to handle the move
            window.parent.postMessage({
                type: 'move-clip',
                segmentSequence: segmentSequence,
                sceneSequence: sceneSequence,
                clipSequence: clipSequence,
                clipType: clipType,
                direction: 'up'
            }, '*');
        }
        
        // Function to move a clip down in sequence
        function moveClipDown(segmentSequence, sceneSequence, clipSequence, clipType) {
            // Send a message to the parent window to handle the move
            window.parent.postMessage({
                type: 'move-clip',
                segmentSequence: segmentSequence,
                sceneSequence: sceneSequence,
                clipSequence: clipSequence,
                clipType: clipType,
                direction: 'down'
            }, '*');
        }
        
        // Listen for messages from the parent window
        window.addEventListener('message', function(event) {
            // Check if the message is clip data for editing
            if (event.data && event.data.type === 'clip-data-for-edit') {
                populateEditForm(event.data.clipData);
            }
            // Check if the message is a new clip path
            else if (event.data && event.data.type === 'new-clip-path') {
                // Update the clip path in the form
                if (document.getElementById('clip-type').value === 'video') {
                    document.getElementById('clip-path').value = event.data.newPath;
                } else {
                    document.getElementById('image-path').value = event.data.newPath;
                }
            }
            // Check if the message is segment data for editing
            else if (event.data && event.data.type === 'segment-data-for-edit') {
                populateSegmentForm(event.data.segmentData);
            }
        });
        
        // Close modals when clicking outside of them
        window.onclick = function(event) {
            const clipModal = document.getElementById('edit-clip-modal');
            const segmentModal = document.getElementById('segment-modal');
            
            if (event.target === clipModal) {
                clipModal.style.display = 'none';
            }
            
            if (event.target === segmentModal) {
                segmentModal.style.display = 'none';
            }
        };
    `;
}

module.exports = getTimelineEventHandlers;

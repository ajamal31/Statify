$(document).ready(function() {

    $('.track-analysis-box').hide();

    var trackID;

    $('.track-img').hover(
        function() {
            $('#analysis' + $(this).attr('track-id')).show(400);
        },
        function() {
            $('#analysis' + $(this).attr('track-id')).hide(400);
        });

    $('.track_img').on('click', function() {
        $('#analysis' + $(this).attr('track-id')).toggle(500);
    });

});


// var trackID = $(this).attr('track-id');
// $('#analysis' + trackID).toggle();

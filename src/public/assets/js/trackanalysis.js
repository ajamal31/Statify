$(document).ready(function() {
    $('.track-img').on('click', function() {
        var trackID = $(this).attr('track-id');
        alert(trackID);
    })
});

// function start(trackAnalysis) {
//     console.log(trackAnalysis[i].danceability);
    // radialProgress(document.getElementById('danceability<%= topTracks[i].id %>'))
    //     .label("Danceability")
    //     .diameter(150)
    //     .minValue(0)
    //     .maxValue(1)
    //     .value(<%= trackAnalysis[i].danceability %>)
    //     .render();
    //
    // radialProgress(document.getElementById('energy<%= topTracks[i].id %>'))
    //     .label("Energy")
    //     .diameter(150)
    //     .minValue(0)
    //     .maxValue(1)
    //     .value(<%= trackAnalysis[i].energy %>)
    //     .render();
    //
    // radialProgress(document.getElementById('loudness<%= topTracks[i].id %>'))
    //     .label("Loudness")
    //     // .onClick(onClick3)
    //     .diameter(150)
    //     .minValue(-60)
    //     .maxValue(0)
    //     .value(<%= trackAnalysis[i].loudness %>)
    //     .render();
// }
